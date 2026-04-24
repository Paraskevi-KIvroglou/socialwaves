/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as beachRefresh from "../beachRefresh.js";
import type * as beaches from "../beaches.js";
import type * as evaluations from "../evaluations.js";
import type * as favorites from "../favorites.js";
import type * as forecasts from "../forecasts.js";
import type * as http from "../http.js";
import type * as openMeteo from "../openMeteo.js";
import type * as openMeteoActions from "../openMeteoActions.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  beachRefresh: typeof beachRefresh;
  beaches: typeof beaches;
  evaluations: typeof evaluations;
  favorites: typeof favorites;
  forecasts: typeof forecasts;
  http: typeof http;
  openMeteo: typeof openMeteo;
  openMeteoActions: typeof openMeteoActions;
  reports: typeof reports;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
