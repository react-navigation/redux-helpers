// @flow

import type { NavigationAction, NavigationState } from '@react-navigation/core';
import type { Reducer } from 'redux';
import type { Navigator, ReducerState } from './types'

import { NavigationActions } from "@react-navigation/core";

const initAction = NavigationActions.init();

function createNavigationReducer(navigator: Navigator): Reducer<*, *> {
  const initialState = navigator.router.getStateForAction(initAction, null);
  return (
    state: ReducerState = initialState,
    action: NavigationAction,
  ): ReducerState => {
    return navigator.router.getStateForAction(action, state) || state;
  };
};

export {
  createNavigationReducer,
  initAction,
};
