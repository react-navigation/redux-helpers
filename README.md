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
* Param `key` needs to be unique for the Redux store. Most people only have one store, so can use any string (eg. `"root"`), as long as it's consistent across all calls.
* Param `navStateSelector` selects the navigation state from your store.

### `initializeListeners` (required)

```js
function initializeListeners(key: string, state: NavigationState): void;
```

* Called it in your main component's `componentDidMount`. Your "main component" is the one that wraps your root navigator.
* Param `key` needs to be consistent with other calls for the same store. See above.
* Param `state` is the navigation state for your app.

### `createNavigationPropConstructor` (required, `react-navigation@2.0.4` or later only)

```js
function createNavigationPropConstructor(
  key: string,
): (
  dispatch: NavigationDispatch,
  state: NavigationState,
) => NavigationScreenProp<NavigationState>;
```

* Call `createNavigationPropConstructor` in the global scope to create a prop constructor.
* Param `key` needs to be consistent with other calls for the same store. See above.
* Prop constructor is called in your main component's `render`.
* Param `dispatch` is your Redux store's dispatch function.
* Param `state` is the navigation state for your app.

### `createReduxBoundAddListener` (alternative to `createNavigationPropConstructor`)

```js
function createReduxBoundAddListener(
  key: string,
): (
  eventName: string,
  handler: NavigationEventCallback
) => NavigationEventSubscription;
```

* Alternative to `createNavigationPropConstructor`.
* Call `createReduxBoundAddListener` in the global scope to construct an `addListener` function.
* Param `key` needs to be consistent with other calls for the same store. See above.
* `addListener` is a necessary property in the `navigation` object that you need to pass as a prop into your root navigator.

### `createDidUpdateCallback` (optional)

```js
function createDidUpdateCallback(key: string): () => void;
```

* Without this function, the first events (ie. `didFocus`) for a screen that hasn't been rendered yet won't trigger `addListener`.
* This happens because our middleware gets triggered before that screen's `componentDidMount` can call `addListener`.
* Param `key` needs to be consistent with other calls for the same store. See above.
* This function should get called in global scope, and will return a callback that should be called in your main component's `componentDidUpdate`.

### `createNavigationReducer` (optional)

```js
function createNavigationReducer(navigator: Navigator): Reducer<*, *>;
```

* Call `createNavigationReducer` in the global scope to construct a navigation reducer.
* This basically just wraps `navigator.router.getStateForAction`, which you can call directly if you'd prefer.
* Param `navigator` is your root navigator (React component).
* Call this reducer from your master reducer (or combine using `combineReducers`).
