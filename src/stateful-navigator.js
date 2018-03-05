// @flow

import type { NavigationEventCallback } from "react-navigation";
import type { Dispatch } from "redux";
import type { NavigationState, NavigationContainer } from "react-navigation";

import * as React from "react";
import { NavigationActions, addNavigationHelpers } from "react-navigation";
import { createReduxBoundAddListener } from "react-navigation-redux-helpers";
import { BackHandler } from "react-native";
import { connect } from "react-redux";

type RootNavigator = NavigationContainer<*, *, *>;

type NavigatorProps = {
  navigation: NavigationState,
  dispatch: Dispatch,
  addListener: (eventName: string, handler: NavigationEventCallback) => any
};

type StatefulNavigatorProps = NavigatorProps & {
  navigator: RootNavigator
};

class StatefulNavigator extends React.PureComponent<StatefulNavigatorProps> {
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
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

export const createNavigator = (key: string, navigator: RootNavigator) => {
  const addListener = createReduxBoundAddListener(key);

  return (props: NavigatorProps) => (
    <StatefulNavigator
      {...props}
      navigator={navigator}
      addListener={addListener}
    />
  );
};

export const createStatefulNavigator = (
  key,
  navStateSelector,
  Navigator: RootNavigator
) => {
  const StatefulNavigator = createNavigator(key, Navigator);

  const mapStateToProps = state => ({
    navigation: navStateSelector(state)
  });

  return connect(mapStateToProps)(StatefulNavigator);
};
