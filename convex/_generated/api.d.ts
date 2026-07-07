/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as associations from "../associations.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as fees from "../fees.js";
import type * as import_ from "../import.js";
import type * as initiatePayment from "../initiatePayment.js";
import type * as nomba from "../nomba.js";
import type * as payments from "../payments.js";
import type * as paymentsInternal from "../paymentsInternal.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as structure from "../structure.js";
import type * as studentRecords from "../studentRecords.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";
import type * as withdrawals from "../withdrawals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  associations: typeof associations;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  fees: typeof fees;
  import: typeof import_;
  initiatePayment: typeof initiatePayment;
  nomba: typeof nomba;
  payments: typeof payments;
  paymentsInternal: typeof paymentsInternal;
  seed: typeof seed;
  sessions: typeof sessions;
  structure: typeof structure;
  studentRecords: typeof studentRecords;
  users: typeof users;
  wallets: typeof wallets;
  withdrawals: typeof withdrawals;
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
