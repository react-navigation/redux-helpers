// @flow

import type {
  NavigationState,
  NavigationDispatch,
  NavigationContainer,
  NavigationScreenProp,
} from 'react-navigation';

import * as React from 'react';
import invariant from 'invariant';

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
function reduxifyNavigator<State: NavigationState, Props: RequiredProps<State>>(
  Navigator: NavigationContainer<
    State,
    *,
    $Diff<Props, RequiredProps<State>>,
  >,
  key: string,
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
      invariant(this.currentNavProp, "should be set");
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
  reduxifyNavigator,
};
