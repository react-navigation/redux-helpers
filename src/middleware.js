// @flow

import type {
  NavigationEventCallback,
  NavigationState,
} from 'react-navigation';
import type { Middleware } from 'redux';

import invariant from 'invariant';

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
    subscribers.forEach(subscriber =>
      subscriber({
        type: 'action',
        action,
        state: navStateSelector(newState),
        lastState: navStateSelector(oldState),
      })
    );
    return result;
  };
}

function createReduxBoundAddListener(key: string) {
  invariant(
    reduxSubscribers.has(key),
    "Cannot listen for a key that isn't associated with a Redux store. " +
      'First call `createReactNavigationReduxMiddleware` so that we know ' +
      'when to trigger your listener.'
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

export {
  createReactNavigationReduxMiddleware,
  createReduxBoundAddListener,
};
