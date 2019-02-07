# react-navigation-redux-helpers

This package allows the user to manage their React Navigation state from within Redux.

## How it works

1. Any navigator can be passed a `navigation` prop to turn it into a "controlled" component, which defers state management to its parent. This mechanism is used in React Navigation to nest navigators, but it can also be used to customize state management.
2. A Redux middleware is used so that any events that mutate the navigation state properly trigger React Navigation's event listeners.
3. Finally, a reducer enables React Navigation actions to mutate the Redux state.

## Motivation

Most projects that are using both Redux and React Navigation don't need this library. And passing `navigation` to the root navigator means that you will have to handle state persistance and `BackHandler` behavior yourself. However, there are some things this library makes easier:

1. It's possible to implement [custom actions](https://github.com/Ashoat/squadcal/blob/4ce900481bbfd1681d568edc669b66b1ae9555f0/native/navigation/navigation-setup.js#L384-L395), allowing you to manipulate the navigation state in ways that aren't possible with the stock React Navigation actions. Though it's possible to implement [custom routers](https://reactnavigation.org/docs/en/custom-routers.html) in React Navigation to do this, it's arguably cleaner via Redux. (If you want animations to run on your action, [make sure](https://github.com/Ashoat/squadcal/blob/4ce900481bbfd1681d568edc669b66b1ae9555f0/native/navigation/navigation-setup.js#L633) to set `isTransitioning` to true!)
2. This library allows the user to customize the persistance of their navigation state. For instance, you could choose to persist your navigation state in encrypted storage. Most users don't need this, as there are no practical downsides to handling persistance of navigation state and Redux state separately. Note that stock React Navigation supports some basic degree of [persistance customization](https://reactnavigation.org/docs/en/state-persistence.html).
3. You can implement [custom reducer behavior](https://github.com/Ashoat/squadcal/blob/4ce900481bbfd1681d568edc669b66b1ae9555f0/native/navigation/navigation-setup.js#L341-L352) to validate state and maintain consistency between navigation state and other application state. This is again possible with custom routers, but likely cleaner to implement without, especially in the context of an existing Redux setup.

## Installation

  ```bash
  yarn add react-navigation-redux-helpers
  ```

  or

  ```bash
  npm install --save react-navigation-redux-helpers
  ```

## Example

```js
import {
  createStackNavigator,
} from 'react-navigation';
import {
  createStore,
  applyMiddleware,
  combineReducers,
} from 'redux';
import {
  createReduxContainer,
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers';
import { Provider, connect } from 'react-redux';
import React from 'react';

const AppNavigator = createStackNavigator(AppRouteConfigs);

const navReducer = createNavigationReducer(AppNavigator);
const appReducer = combineReducers({
  nav: navReducer,
  ...
});

// Note: createReactNavigationReduxMiddleware must be run before createReduxContainer
const middleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav,
);

const App = createReduxContainer(AppNavigator, "root");
const mapStateToProps = (state) => ({
  state: state.nav,
});
const AppWithNavigationState = connect(mapStateToProps)(App);

const store = createStore(
  appReducer,
  applyMiddleware(middleware),
);

class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppWithNavigationState />
      </Provider>
    );
  }
}
```

## API

### `createReactNavigationReduxMiddleware` (required)

```js
function createReactNavigationReduxMiddleware<State: {}>(
  navStateSelector: (state: State) => NavigationState,
  key?: string,
): Middleware<State, *, *>;
```

* Returns a middleware that can be applied to a Redux store.
* Param `navStateSelector` selects the navigation state from your store.
* Param `key` needs to be unique for the Redux store and consistent with the call to `createReduxContainer` below. You can leave it out if you only have one store.

### `createReduxContainer` (required)

```js
function createReduxContainer(
  navigator: Navigator,
  key?: string,
): React.ComponentType<{ state: NavigationState, dispatch: Dispatch }>;
```

* Returns a HOC (higher-order component) that wraps your root navigator.
* `createReactNavigationReduxMiddleware` must be called before this one!
* Param `navigator` is your root navigator (React component).
* Param `key` needs to be consistent with the call to `createReactNavigationReduxMiddleware` above. You can leave it out if you only have one store.
* Returns a component to use in place of your root navigator. Pass it `state` and `dispatch` props that you get via `react-redux`'s `connect`.

### `createNavigationReducer` (optional)

```js
function createNavigationReducer(navigator: Navigator): Reducer<*, *>;
```

* Call `createNavigationReducer` in the global scope to construct a navigation reducer.
* This basically just wraps `navigator.router.getStateForAction`, which you can call directly if you'd prefer.
* Param `navigator` is your root navigator (React component).
* Call this reducer from your master reducer, or combine using `combineReducers`.

## Miscellaneous

### Mocking tests

To make Jest tests work with your React Navigation app, you need to [change the Jest preset](https://jestjs.io/docs/en/tutorial-react-native) in your `package.json`:

```js
"jest": {
  "preset": "react-native",
  "transformIgnorePatterns": [
    "node_modules/(?!(jest-)?react-native|react-navigation|react-navigation-redux-helpers)"
  ]
}
```

### Back button

Here is a code snippet that demonstrates how the user might handle the hardware back button on platforms like Android:

```js
import React from "react";
import { BackHandler } from "react-native";
import { NavigationActions } from "react-navigation";

/* your other setup code here! this is not a runnable snippet */

class ReduxNavigation extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    const { dispatch, nav } = this.props;
    if (nav.index === 0) {
      return false;
    }

    dispatch(NavigationActions.back());
    return true;
  };

  render() {
    /* more setup code here! this is not a runnable snippet */
    return <AppNavigator navigation={navigation} />;
  }
}
```
