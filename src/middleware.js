// @flow

import type {
  NavigationEventCallback,
  NavigationEventPayload,
  NavigationState,
  NavigationDispatch,
  NavigationScreenProp,
  NavigationRouter,
} from '@react-navigation/core';
import type { Middleware } from 'redux';

import invariant from 'invariant';
import { getNavigation } from '@react-navigation/core';

import { initAction } from './reducer';

const reduxSubscribers = new Map();
function getReduxSubscribers(key: string): Set<NavigationEventCallback> {
  let subscribers = reduxSubscribers.get(key);
  if (!subscribers) {
    subscribers = new Set();
    reduxSubscribers.set(key, subscribers);
  }
  return subscribers;
}

// screenProps are a legacy concept in React Navigation,
// and should not be used in redux apps
const EMPTY_SCREEN_PROPS = {};
const getScreenProps = () => EMPTY_SCREEN_PROPS;

function createReactNavigationReduxMiddleware<State: {}>(
  navStateSelector: (state: State) => NavigationState,
  key?: string = "root",
): Middleware<State, *, *> {
  return store => next => action => {
    const oldState = store.getState();
    const result = next(action);
    const newState = store.getState();
    triggerAllSubscribers(
      key,
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

const delayedTriggers = new Map();

function triggerAllSubscribers(key: string, payload: NavigationEventPayload) {
  const trigger =
    () => getReduxSubscribers(key).forEach(subscriber => subscriber(payload));
  if (
    !payload.action ||
    !payload.action.hasOwnProperty('type') ||
    !payload.action.type.startsWith("Navigation") ||
    payload.state === payload.lastState
  ) {
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
  return triggerDelayedSubscribers.bind(null, key);
}

function initializeListeners(key: string, state: NavigationState) {
  triggerAllSubscribers(
    key,
    {
      type: 'action',
      action: initAction,
      state: state,
      lastState: null,
    },
  );
  triggerDelayedSubscribers(key);
}

function createNavigationPropConstructor(key: string) {
  return <State: NavigationState>(
    dispatch: NavigationDispatch,
    state: State,
    router: NavigationRouter<*, *>,
    getCurrentNavigation: () => ?NavigationScreenProp<State>,
  ): NavigationScreenProp<State> => {
    invariant(
      router,
      "App.router must be provided to createNavigationPropConstructor as of " +
        "react-navigation-redux-helpers@2.0.0. Learn more: " +
        "https://reactnavigation.org/docs/en/" +
        "redux-integration.html#breaking-changes-in-2.3",
    );
    invariant(
      getCurrentNavigation,
      "getCurrentNavigation must be provided to createNavigationPropConstructor as of " +
        "react-navigation-redux-helpers@2.0.0. Learn more: " +
        "https://reactnavigation.org/docs/en/" +
        "redux-integration.html#breaking-changes-in-2.3",
    );
    return getNavigation(
      router,
      state,
      dispatch,
      getReduxSubscribers(key),
      getScreenProps,
      getCurrentNavigation,
    );
  };
}

export {
  createReactNavigationReduxMiddleware,
  createDidUpdateCallback,
  initializeListeners,
  createNavigationPropConstructor,
};
