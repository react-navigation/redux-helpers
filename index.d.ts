declare module 'react-navigation-redux-helpers' {
    import { NavigationContainer, NavigationEventCallback, NavigationEventSubscription, NavigationState } from 'react-navigation';
    import { Middleware, Reducer } from 'redux';

    export type Navigator = NavigationContainer;

    export type ReducerState = NavigationState | null | undefined;

    export function initializeListeners(key: string, state: NavigationState): void;

    export function createReactNavigationReduxMiddleware<S>
    (key: string, navStateSelector: (state: S) => NavigationState): Middleware;

    export function createReduxBoundAddListener
    (key: string): (eventName: string, callback: NavigationEventCallback) => NavigationEventSubscription;

    export function createNavigationReducer(navigator: Navigator): Reducer<ReducerState>;
}
