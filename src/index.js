// @flow

import invariant from 'invariant';

import { createReactNavigationReduxMiddleware } from './middleware';
import { reduxifyNavigator } from './reduxify-navigator';
import { createNavigationReducer } from './reducer';

function initializeListeners() {
  invariant(
    false,
    "initializeListeners is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use reduxifyNavigator " +
      "instead.",
  );
}

function createReduxBoundAddListener() {
  invariant(
    false,
    "createReduxBoundAddListener is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use reduxifyNavigator " +
      "instead.",
  );
}

function createNavigationPropConstructor() {
  invariant(
    false,
    "createNavigationPropConstructor is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use reduxifyNavigator " +
      "instead.",
  );
}

function createDidUpdateCallback() {
  invariant(
    false,
    "createDidUpdateCallback is deprecated in " +
      "react-navigation-redux-helpers@2.0.0! Please use reduxifyNavigator " +
      "instead.",
  );
}

export * from './types';
export {
  // Current
  createReactNavigationReduxMiddleware,
  reduxifyNavigator,
  createNavigationReducer,
  // Deprecated
  initializeListeners,
  createReduxBoundAddListener,
  createNavigationPropConstructor,
  createDidUpdateCallback,
};
