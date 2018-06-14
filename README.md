# react-navigation-redux-helpers

This repo contains Redux middleware and utils for React Navigation.

## Installation

  ```bash
  yarn add react-navigation-redux-helpers
  ```

  or

  ```bash
  npm install --save react-navigation-redux-helpers
  ```

## Use

Consult the [React Navigation](https://reactnavigation.org/docs/redux-integration.html) docs for how to use this library.

## API

### `createReactNavigationReduxMiddleware` (required)

```js
function createReactNavigationReduxMiddleware<State: {}>(
  key: string,
  navStateSelector: (state: State) => NavigationState,
): Middleware<State, *, *>;
```

* Returns a middleware that can be applied to a Redux store.
* Param `key` needs to be unique for the Redux store. Most people only have one store, so can use any string (eg. `"root"`), as long as it's consistent with the call to `reduxifyNavigator` below.
* Param `navStateSelector` selects the navigation state from your store.

### `reduxifyNavigator` (required)

```js
function reduxifyNavigator(
  navigator: Navigator,
  key: string,
): React.ComponentType<{ state: NavigationState, dispatch: Dispatch }>;
```

* Returns a HOC (higher-order component) that wraps your root navigator.
* `createReactNavigationReduxMiddleware` must be called before this one!
* Param `navigator` is your root navigator (React component).
* Param `key` needs to be consistent with the call to `createReactNavigationReduxMiddleware` above.
* Returns a component to use in place of your root navigator. Pass it `state` and `dispatch` props that you get via `react-redux`'s `connect`.

### `createNavigationReducer` (optional)

```js
function createNavigationReducer(navigator: Navigator): Reducer<*, *>;
```

* Call `createNavigationReducer` in the global scope to construct a navigation reducer.
* This basically just wraps `navigator.router.getStateForAction`, which you can call directly if you'd prefer.
* Param `navigator` is your root navigator (React component).
* Call this reducer from your master reducer, or combine using `combineReducers`.
