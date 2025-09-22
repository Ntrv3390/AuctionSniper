/* ui-router-compat.ts
   Compatibility layer: ui-router / $state-like API on top of Angular Router
   Place in src/app/router or src/app/services
*/

import { Injectable } from '@angular/core';
import {
  Router,
  Routes,
  Route,
  NavigationExtras,
  UrlTree,
  ActivatedRouteSnapshot,
  Params,
  ActivatedRoute,
} from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { ResolveFn } from '@angular/router';

/**
 * Interfaces adapted from your angular.ui declarations to Angular Router world.
 * - IState roughly maps to an Angular Route with some extra UI-Router-style fields.
 * - IStateService is our compatibility interface.
 */

export interface IState {
  /** name used by ui-router apps (set route.data?.name on Angular routes) */
  name?: string;

  /** Angular Router fields mapped: path <-> url, component, loadComponent, children */
  url?: string; // original ui-router url
  path?: string; // Angular route path
  component?: any;
  loadComponent?: () => Promise<any>;
  children?: IState[];
  data?: any;

  /** resolves - we preserve the keys (Angular resolve functions are ResolveFn) */
  resolve?: { [key: string]: ResolveFn<any> };

  /** params default values etc. */
  params?: any;

  /** other ui-router flags */
  abstract?: boolean;
  reloadOnSearch?: boolean;
}

export interface IStateOptions {
  /* corresponds to Angular NavigationExtras-ish options */
  location?: boolean | string;
  inherit?: boolean;
  relative?: IState;
  notify?: boolean;
  reload?: boolean;
  queryParams?: Params;
  replaceUrl?: boolean;
  state?: any;
}

export interface IHrefOptions {
  lossy?: boolean;
  inherit?: boolean;
  relative?: IState;
  absolute?: boolean;
  queryParams?: Params;
  fragment?: string;
}

export interface IStateService {
  go(to: string | string[], params?: Params, options?: IStateOptions): Promise<boolean>;
  transitionTo(state: string, params?: Params, options?: IStateOptions | boolean): Promise<boolean>;
  includes(state: string, params?: Params): boolean;
  is(state: string, params?: Params): boolean;
  href(stateOrName: string | IState, params?: Params, options?: IHrefOptions): string;
  get(stateName?: string): IState | IState[] | undefined;
  current(): IState | null;
  params(): Params;
  reload(): Promise<boolean>;
}
