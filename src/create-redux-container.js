// @flow

import type {
  NavigationState,
  NavigationDispatch,
  NavigationNavigator,
  NavigationScreenProp,
  NavigationNavigatorProps,
  SupportedThemes,
} from '@react-navigation/core';

import * as React from 'react';
import { ThemeProvider, NavigationProvider } from '@react-navigation/core';

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
    theme: SupportedThemes | 'no-preference',
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
    static defaultProps = { theme: 'no-preference' };

    componentDidMount() {
      initializeListeners(key, this.props.state);
    }

    componentDidUpdate() {
      didUpdateCallback();
    }

    getCurrentNavigation = () => {
      return this.currentNavProp;
    }

    get theme() {
      if (this.props.theme === 'light' || this.props.theme === 'dark') {
        return this.props.theme;
      } else if (this.props.theme === 'no-preference') {
        return 'light';
      } else {
        console.warn(
          `Invalid theme provided: ${
            this.props.theme
          }. Only 'light' and 'dark' are supported. Falling back to 'light'`
        );
        return 'light';
      }
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
        <ThemeProvider value={this.theme}>
          <NavigationProvider value={this.currentNavProp}>
            <Navigator
              {...props}
              navigation={this.currentNavProp}
            />
          </NavigationProvider>
        </ThemeProvider>
      );
    }

  }

  return NavigatorReduxWrapper;
}

export {
  createReduxContainer,
};
