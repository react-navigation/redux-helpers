declare module 'react-navigation-redux-helpers' {
  import {
    NavigationContainer,
    NavigationEventCallback,
    NavigationEventSubscription,
    NavigationState,
    NavigationDispatch,
    NavigationScreenProp
  } from 'react-navigation';
  import * as React from 'react';
  import { Middleware, Reducer } from 'redux';

  export type Navigator = NavigationContainer;

  export type ReducerState = NavigationState | null | undefined;

  export function createReactNavigationReduxMiddleware<S>
  (key: string, navStateSelector: (state: S) => NavigationState): Middleware;

  export function createNavigationReducer(navigator: Navigator): Reducer<ReducerState>;

  export function reduxifyNavigator<S>(
    navigator: Navigator,
    key: string,
  ): React.ComponentType<{ state: NavigationState; dispatch: NavigationDispatch }>;
}
