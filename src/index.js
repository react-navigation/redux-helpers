// @flow

import invariant from 'invariant';

import { createReactNavigationReduxMiddleware } from './middleware';
import { createReduxContainer } from './create-redux-container';
import { createNavigationReducer } from './reducer';

function initializeListeners() {
  invariant(
    false,
    "initializeListeners is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use createReduxContainer " +
      "instead.",
  );
}

function createReduxBoundAddListener() {
  invariant(
    false,
    "createReduxBoundAddListener is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use createReduxContainer " +
      "instead.",
  );
}

function createNavigationPropConstructor() {
  invariant(
    false,
    "createNavigationPropConstructor is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use createReduxContainer " +
      "instead.",
  );
}

function createDidUpdateCallback() {
  invariant(
    false,
    "createDidUpdateCallback is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use createReduxContainer " +
      "instead.",
  );
}

function reduxifyNavigator() {
  invariant(
    false,
    "reduxifyNavigator is deprecated in " +
      "react-navigation-redux-helpers@3.0.0! Please use createReduxContainer " +
      "instead.",
  );
}

export * from './types';
export {
  // Current
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
  createReduxContainer,
  // Deprecated
  reduxifyNavigator,
  initializeListeners,
  createReduxBoundAddListener,
  createNavigationPropConstructor,
  createDidUpdateCallback,
};
