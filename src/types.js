// @flow

import type { NavigationContainer, NavigationState } from 'react-navigation';

export type Navigator = NavigationContainer<*, *, *>;
export type ReducerState = ?NavigationState;
export type NavStateSelector<State> = (state: State) => NavigationState;
