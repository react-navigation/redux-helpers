// @flow

import type { Middleware } from 'redux';

import type {
  ReducerState,
  NavStateSelector,
  OnScreenChangeCallback,
} from './types';

import { NavigationActions } from "react-navigation";

function getCurrentRouteName(navigationState: ReducerState) {
  if (!navigationState) return null;

  const route = navigationState.routes[navigationState.index];

  // dive into nested navigators
  if (route.routes) return getCurrentRouteName(route);

  return route.routeName;
};

export function createScreenTrackingMiddleware<State: {}> (
  navStateSelector: NavStateSelector<State>,
  onScreenChange: OnScreenChangeCallback
): Middleware<State, *, *> {
  return store => next => action => {
    if (
      action.type !== NavigationActions.NAVIGATE &&
      action.type !== NavigationActions.BACK
    ) {
      return next(action);
    }

    const oldState = store.getState();
    const fromScreen = getCurrentRouteName(navStateSelector(oldState));

    const result = next(action);

    const newState = store.getState();
    const toScreen = getCurrentRouteName(navStateSelector(newState));

    if (toScreen !== fromScreen) {
      onScreenChange(fromScreen, toScreen);
    }

    return result;
  };
};
