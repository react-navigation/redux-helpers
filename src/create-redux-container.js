// @flow

import type {
  NavigationState,
  NavigationDispatch,
  NavigationContainer,
  NavigationScreenProp,
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
function createReduxContainer<State: NavigationState, Props: RequiredProps<State>>(
  Navigator: NavigationContainer<
    State,
    *,
    $Diff<Props, RequiredProps<State>>,
  >,
  key?: string = "root",
): React.ComponentType<Props> {
  const didUpdateCallback = createDidUpdateCallback(key);
  const propConstructor = createNavigationPropConstructor(key);

  class NavigatorReduxWrapper extends React.PureComponent<Props> {

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
