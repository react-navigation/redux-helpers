// @flow

import type {
  NavigationEventCallback,
  NavigationEventPayload,
  NavigationState,
} from 'react-navigation';
import type { Middleware } from 'redux';

import invariant from 'invariant';

import { initAction } from './reducer';

const reduxSubscribers = new Map();

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

function triggerAllSubscribers(
  subscribers: Set<NavigationEventCallback>,
  payload: NavigationEventPayload,
) {
  subscribers.forEach(subscriber => subscriber(payload));
}

function createReduxBoundAddListener(key: string) {
  invariant(
    reduxSubscribers.has(key),
    "Cannot listen for a key that isn't associated with a Redux store. " +
      "First call `createReactNavigationReduxMiddleware` so that we know " +
      "when to trigger your listener."
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
    subscribers,
    {
      type: 'action',
      action: initAction,
      state: state,
      lastState: null,
    },
  );
}

export {
  createReactNavigationReduxMiddleware,
  createReduxBoundAddListener,
  initializeListeners,
};
