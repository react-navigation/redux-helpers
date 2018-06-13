// @flow

import {
  type NavigationEventCallback,
  type NavigationEventPayload,
  type NavigationState,
  type NavigationDispatch,
  type NavigationScreenProp,
  type NavigationRouter,
  getNavigation,
} from 'react-navigation';
import type { Middleware } from 'redux';

import invariant from 'invariant';

import { initAction } from './reducer';

const reduxSubscribers = new Map();

// screenProps are a legacy concept in React Navigation,
// and should not be used in redux apps
const EMPTY_SCREEN_PROPS = {};
const getScreenProps = () => EMPTY_SCREEN_PROPS;

function createReactNavigationReduxMiddleware<State: {}>(
  key: string,
  navStateSelector: (state: State) => NavigationState,
): Middleware<State, *, *> {
  reduxSubscribers.set(key, new Set());
  return store => next => action => {
    const oldState = store.getState();
    const result = next(action);
    const newState = store.getState();
    const subscribers = reduxSubscribers.get(key);
    invariant(subscribers, `subscribers set should exist for ${key}`);
    triggerAllSubscribers(
      key,
      subscribers,
      {
        type: 'action',
        action,
        state: navStateSelector(newState),
        lastState: navStateSelector(oldState),
      },
    );
    return result;
  };
}

let delaySubscriberTriggerUntilReactReduxConnectTriggers = false;
const delayedTriggers = new Map();

function triggerAllSubscribers(
  key: string,
  subscribers: Set<NavigationEventCallback>,
  payload: NavigationEventPayload,
) {
  const trigger = () => subscribers.forEach(subscriber => subscriber(payload));
  if (!delaySubscriberTriggerUntilReactReduxConnectTriggers) {
    trigger();
    return;
  }
  const existingTriggers = delayedTriggers.get(key);
  if (existingTriggers) {
    existingTriggers.push(trigger);
  } else {
    delayedTriggers.set(key, [trigger]);
  }
}

function triggerDelayedSubscribers(key: string) {
  const triggers = delayedTriggers.get(key);
  if (!triggers) {
    return;
  }
  delayedTriggers.delete(key);
  for (let trigger of triggers) {
    trigger();
  }
}

function createDidUpdateCallback(key: string) {
  delaySubscriberTriggerUntilReactReduxConnectTriggers = true;
  return triggerDelayedSubscribers.bind(null, key);
}

function createReduxBoundAddListener(key: string) {
  invariant(
    reduxSubscribers.has(key),
    "Cannot listen for a key that isn't associated with a Redux store. " +
      "First call `createReactNavigationReduxMiddleware` so that we know " +
      "when to trigger your listener.",
  );
  return (eventName: string, handler: NavigationEventCallback) => {
    if (eventName !== 'action') {
      return { remove: () => {} };
    }
    const subscribers = reduxSubscribers.get(key);
    invariant(subscribers, `subscribers set should exist for ${key}`);
    subscribers.add(handler);
    return {
      remove: () => {
        subscribers.delete(handler);
      },
    };
  };
}

function initializeListeners(key: string, state: NavigationState) {
  const subscribers = reduxSubscribers.get(key);
  invariant(
    subscribers,
    "Cannot initialize listeners for a key that isn't associated with a " +
      "Redux store. First call `createReactNavigationReduxMiddleware` so " +
      "that we know when to trigger your listener.",
  );
  triggerAllSubscribers(
    key,
    subscribers,
    {
      type: 'action',
      action: initAction,
      state: state,
      lastState: null,
    },
  );
  if (delaySubscriberTriggerUntilReactReduxConnectTriggers) {
    triggerDelayedSubscribers(key);
  }
}

function createNavigationPropConstructor(key: string) {
  const actionSubscribers = new Set();
  const reactNavigationAddListener = createReduxBoundAddListener(key);
  return (
    dispatch: NavigationDispatch,
    state: NavigationState,
    router: NavigationRouter,
    getCurrentNavigation: () => NavigationScreenProp<NavigationState>,
  ): NavigationScreenProp<NavigationState> => {
    invariant(
      router,
      `App.router must be provided to createNavigationPropConstructor, as of react-navigation-redux-helpers v2. Learn more: https://reactnavigation.org/docs/en/redux-integration.html#breaking-changes-in-2.3`,
    );
    invariant(
      getCurrentNavigation,
      `getCurrentNavigation must be provided to createNavigationPropConstructor, as of react-navigation-redux-helpers v2. Learn more: https://reactnavigation.org/docs/en/redux-integration.html#breaking-changes-in-2.3`,
    );
    return getNavigation(
      router,
      state,
      dispatch,
      actionSubscribers,
      getScreenProps,
      getCurrentNavigation,
    );
  };
}

export {
  createReactNavigationReduxMiddleware,
  createDidUpdateCallback,
  createReduxBoundAddListener,
  initializeListeners,
  createNavigationPropConstructor,
};
