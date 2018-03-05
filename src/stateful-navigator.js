// @flow

import type { NavigationEventCallback } from 'react-navigation';
import type { Dispatch } from 'redux';
import type { NavigationState, NavigationContainer } from 'react-navigation';
import type { Navigator, ReducerState, NavStateSelector } from './types';

import * as React from 'react';
import { NavigationActions, addNavigationHelpers } from 'react-navigation';
import { BackHandler } from 'react-native';
import { connect } from 'react-redux';

import { createReduxBoundAddListener } from './middleware';

type NavigatorProps = {
  navigation: ReducerState,
  dispatch: Dispatch<*>,
  addListener: (eventName: string, handler: NavigationEventCallback) => any
};

type StatefulNavigatorProps = NavigatorProps & {
  navigator: Navigator
};

class StatefulNavigator extends React.PureComponent<StatefulNavigatorProps> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = () => {
    if (this.props.navigation.index === 0) {
      return false;
    }

    this.props.dispatch(NavigationActions.back());

    return true;
  };

  render() {
    const navigation = addNavigationHelpers({
      dispatch: this.props.dispatch,
      state: this.props.navigation,
      addListener: this.props.addListener
    });

    return React.createElement(this.props.navigator, {
      navigation
    });
  }
}

function createNavigator(key: string, navigator: Navigator) {
  const addListener = createReduxBoundAddListener(key);

  return (props: NavigatorProps) => (
    <StatefulNavigator
      {...props}
      navigator={navigator}
      addListener={addListener}
    />
  );
};

function createStatefulNavigator(
  key: string,
  navStateSelector: NavStateSelector<*>,
  Navigator: Navigator
) {
  const StatefulNavigator = createNavigator(key, Navigator);
  const mapStateToProps = state => ({ navigation: navStateSelector(state) });
  return connect(mapStateToProps)(StatefulNavigator);
};

export {
  createStatefulNavigator,
  createNavigator
};
