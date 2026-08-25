/**
 * Enterprise Cookie & Consent Management Types
 * Standardized across client and server environments.
 */

export type CookieCategory = "necessary" | "functional" | "analytics" | "marketing"

export type SameSiteOption = "strict" | "lax" | "none" | "Strict" | "Lax" | "None"

export type CookiePriority = "low" | "medium" | "high"

export interface CookieOptions {
  /** Lifetime of cookie in seconds from creation */
  maxAge?: number
  /** Absolute expiration date */
  expires?: Date | string
  /** URL path scope for the cookie. Defaults to '/' */
  path?: string
  /** Domain scope for the cookie */
  domain?: string
  /** Enforces HTTPS transmission only */
  secure?: boolean
  /** SameSite policy to mitigate CSRF */
  sameSite?: SameSiteOption
  /** Prevents client-side script access (Server / Set-Cookie headers only) */
  httpOnly?: boolean
  /** Partitioned cookie support (CHIPS standard) */
  partitioned?: boolean
  /** Priority attribute for browser eviction queues */
  priority?: CookiePriority
}

export interface ConsentPreferences {
  necessary: true // Strictly necessary is always true and cannot be disabled
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export interface ConsentState extends ConsentPreferences {
  /** ISO timestamp when consent was granted or modified */
  timestamp: string
  /** Schema policy version */
  version: string
}

export interface CookieDefinition {
  name: string
  category: CookieCategory
  description: string
  defaultMaxAge: number // in seconds
  isServerOnly?: boolean
  secureOnly?: boolean
  sameSiteDefault?: SameSiteOption
}

/** Supported predefined cookie keys */
export type KnownCookieKey =
  | "app_session_token"
  | "__Host-app_session_token"
  | "csrf_token"
  | "guest_session_id"
  | "app_theme"
  | "app_workspace_prefs"
  | "app_consent_preferences"
  | "analytics_session_id"
  | "ref_source"

export type CookieKey = KnownCookieKey | (string & {})
