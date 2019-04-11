// @flow

import type {
  NavigationState,
  NavigationDispatch,
  NavigationNavigator,
  NavigationScreenProp,
  NavigationNavigatorProps,
} from '@react-navigation/core';

import * as React from 'react';

import {
  initializeListeners,
  createDidUpdateCallback,
  createNavigationPropConstructor,
} from './middleware';

type RequiredProps<State: NavigationState> = {
  state: State,
  dispatch: NavigationDispatch,
};
type InjectedProps<State: NavigationState> = {
  navigation: NavigationScreenProp<State>,
};
function createReduxContainer<
  State: NavigationState,
  Options: {},
  NavigatorProps: NavigationNavigatorProps<Options, State>,
  NavigatorType: NavigationNavigator<
    State,
    Options,
    NavigatorProps,
  >,
  ContainerProps: {
    ...$Diff<NavigatorProps, InjectedProps<State>>,
    ...$Exact<RequiredProps<State>>,
  },
>(
  Navigator: NavigatorType,
  key?: string = "root",
): React.ComponentType<ContainerProps> {
  const didUpdateCallback = createDidUpdateCallback(key);
  const propConstructor = createNavigationPropConstructor(key);

  class NavigatorReduxWrapper extends React.PureComponent<ContainerProps> {

    static router = Navigator.router;
    currentNavProp: ?NavigationScreenProp<State>;

    componentDidMount() {
      initializeListeners(key, this.props.state);
    }

    componentDidUpdate() {
      didUpdateCallback();
    }

    getCurrentNavigation = () => {
      return this.currentNavProp;
    }

    render() {
      const { dispatch, state, ...props } = this.props;
      this.currentNavProp = propConstructor(
        dispatch,
        state,
        Navigator.router,
        this.getCurrentNavigation,
      );
      return (
        <Navigator
          {...props}
          navigation={this.currentNavProp}
        />
      );
    }

  }

  return NavigatorReduxWrapper;
}

export {
  createReduxContainer,
};
