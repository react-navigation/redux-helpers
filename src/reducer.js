// @flow

import type { NavigationAction, NavigationState } from 'react-navigation';
import type { Reducer } from 'redux';
import type { Navigator, ReducerState } from './types'

import { NavigationActions } from "react-navigation";

function createNavigationReducer(navigator: Navigator): Reducer<*, *> {
  const initialState = navigator.router.getStateForAction(
    NavigationActions.init(),
    null,
  );

  return (
    state: ReducerState = initialState,
    action: NavigationAction
  ): ReducerState => {
    return navigator.router.getStateForAction(action, state);
  };
};

export {
  createNavigationReducer,
};
