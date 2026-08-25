import type { CookieCategory, CookieDefinition, ConsentState } from "./types"

export const CONSENT_COOKIE_KEY = "app_consent_preferences"
export const CONSENT_VERSION = "1.0.0"
export const CONSENT_EVENT_NAME = "datamaster:consent-change"
export const MAX_COOKIE_BYTES = 4096

/** Default consent state before explicit user interaction */
export const DEFAULT_CONSENT_STATE: ConsentState = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: CONSENT_VERSION,
}

/** Full registry metadata for supported cookies */
export const COOKIE_REGISTRY: Record<string, CookieDefinition> = {
  app_session_token: {
    name: "app_session_token",
    category: "necessary",
    description: "Encrypted authentication session identifier for authenticated user sessions.",
    defaultMaxAge: 14 * 86400, // 14 days
    isServerOnly: true,
    secureOnly: true,
    sameSiteDefault: "Lax",
  },
  "__Host-app_session_token": {
    name: "__Host-app_session_token",
    category: "necessary",
    description: "Hardened host-bound session token restricted to origin with secure path locking.",
    defaultMaxAge: 14 * 86400,
    isServerOnly: true,
    secureOnly: true,
    sameSiteDefault: "Lax",
  },
  csrf_token: {
    name: "csrf_token",
    category: "necessary",
    description: "Cryptographic token to defend against Cross-Site Request Forgery attacks.",
    defaultMaxAge: 86400, // 24 hours
    isServerOnly: false,
    secureOnly: true,
    sameSiteDefault: "Strict",
  },
  guest_session_id: {
    name: "guest_session_id",
    category: "necessary",
    description: "Anonymous guest workspace identifier to retain SQL workbench tabs prior to sign-in.",
    defaultMaxAge: 2 * 86400, // 48 hours
    isServerOnly: false,
    secureOnly: true,
    sameSiteDefault: "Lax",
  },
  app_theme: {
    name: "app_theme",
    category: "functional",
    description: "Persists UI theme choice (dark, light, system) for consistent rendering.",
    defaultMaxAge: 365 * 86400, // 1 year
    isServerOnly: false,
    secureOnly: false,
    sameSiteDefault: "Lax",
  },
  app_workspace_prefs: {
    name: "app_workspace_prefs",
    category: "functional",
    description: "Stores sidebar collapse preferences, editor font settings, and panel dimensions.",
    defaultMaxAge: 90 * 86400, // 90 days
    isServerOnly: false,
    secureOnly: false,
    sameSiteDefault: "Lax",
  },
  app_consent_preferences: {
    name: "app_consent_preferences",
    category: "necessary", // Consent storage itself is exempt as a strictly necessary legal compliance record
    description: "Stores your explicit GDPR / ePrivacy consent choices and timestamp record.",
    defaultMaxAge: 365 * 86400, // 1 year
    isServerOnly: false,
    secureOnly: false,
    sameSiteDefault: "Lax",
  },
  analytics_session_id: {
    name: "analytics_session_id",
    category: "analytics",
    description: "Anonymous first-party telemetry session identifier to diagnose query speeds and feature usage.",
    defaultMaxAge: 30 * 86400, // 30 days
    isServerOnly: false,
    secureOnly: false,
    sameSiteDefault: "Lax",
  },
  ref_source: {
    name: "ref_source",
    category: "marketing",
    description: "Captures campaign attribution, referral codes, and UTM parameter metrics.",
    defaultMaxAge: 30 * 86400, // 30 days
    isServerOnly: false,
    secureOnly: false,
    sameSiteDefault: "Lax",
  },
}

/** Human-readable category display names and descriptions */
export const CATEGORY_INFO: Record<
  CookieCategory,
  {
    title: string
    description: string
    required: boolean
    badge: string
  }
> = {
  necessary: {
    title: "Strictly Necessary",
    description:
      "Essential for core platform operations, cryptographic authentication, CSRF mitigation, and anonymous workspace continuity. These cannot be disabled.",
    required: true,
    badge: "Always Active",
  },
  functional: {
    title: "Functional & Preferences",
    description:
      "Enables persistence of your chosen theme (dark/light), sidebar layout states, and custom SQL workbench configuration.",
    required: false,
    badge: "Configurable",
  },
  analytics: {
    title: "Performance & Analytics",
    description:
      "Allows us to aggregate anonymous first-party telemetry to inspect query execution latencies and optimize system stability. Zero personal identifiers.",
    required: false,
    badge: "Opt-In",
  },
  marketing: {
    title: "Marketing & Referrals",
    description:
      "Used to measure the efficacy of developer documentation referrals, educational tutorials, and campaign attribution links.",
    required: false,
    badge: "Opt-In",
  },
}
