/**
 * Client-Side Cookie & Consent Management Engine
 * Provides type-safe cookie manipulation with GDPR / ePrivacy consent enforcement.
 */

import type {
  CookieCategory,
  CookieKey,
  CookieOptions,
  ConsentPreferences,
  ConsentState,
} from "./types"
import {
  COOKIE_REGISTRY,
  CONSENT_COOKIE_KEY,
  CONSENT_VERSION,
  CONSENT_EVENT_NAME,
  DEFAULT_CONSENT_STATE,
  MAX_COOKIE_BYTES,
} from "./config"

/** Check if running in a client browser context */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

/** Check if current page is served over HTTPS */
export function isHttps(): boolean {
  if (!isBrowser()) return false
  return window.location.protocol === "https:"
}

/**
 * Parses all document cookies into a key-value record.
 */
export function getAllCookies(): Record<string, string> {
  if (!isBrowser() || !document.cookie) {
    return {}
  }

  const result: Record<string, string> = {}
  const items = document.cookie.split(";")

  for (const item of items) {
    const eqIdx = item.indexOf("=")
    if (eqIdx === -1) continue

    const key = item.substring(0, eqIdx).trim()
    const val = item.substring(eqIdx + 1).trim()

    if (!key) continue

    try {
      result[key] = decodeURIComponent(val)
    } catch {
      result[key] = val
    }
  }

  return result
}

/**
 * Retrieves a cookie value by name.
 * Automatically parses JSON objects if the stored value is JSON formatted.
 */
export function getCookie<T = string>(name: CookieKey): T | null {
  if (!isBrowser() || !name) return null

  const cookies = getAllCookies()
  const rawValue = cookies[name]

  if (rawValue === undefined || rawValue === null) {
    return null
  }

  // Attempt JSON parse
  if (
    (rawValue.startsWith("{") && rawValue.endsWith("}")) ||
    (rawValue.startsWith("[") && rawValue.endsWith("]"))
  ) {
    try {
      return JSON.parse(rawValue) as T
    } catch {
      return rawValue as unknown as T
    }
  }

  return rawValue as unknown as T
}

/**
 * Retrieves the current GDPR consent preferences.
 * Returns null if user has not yet made an explicit choice.
 */
export function getConsentPreferences(): ConsentState | null {
  const consent = getCookie<ConsentState>(CONSENT_COOKIE_KEY)
  if (consent && typeof consent === "object" && consent.necessary === true && consent.timestamp) {
    return consent
  }
  return null
}

/**
 * Checks whether user has responded to the consent banner.
 */
export function hasUserRespondedToConsent(): boolean {
  return getConsentPreferences() !== null
}

/**
 * Evaluates whether a cookie can be set under the active consent policy.
 */
export function isCookieAllowedByConsent(name: string): boolean {
  const def = COOKIE_REGISTRY[name]
  const category: CookieCategory = def ? def.category : "functional"

  // Strictly necessary cookies are always permitted
  if (category === "necessary") {
    return true
  }

  const consent = getConsentPreferences()

  // If user hasn't made a choice yet, block non-essential cookies
  if (!consent) {
    return false
  }

  return Boolean(consent[category])
}

/**
 * Sets a cookie in `document.cookie` with consent enforcement and OWASP security defaults.
 * Returns true if written, or false if blocked by consent.
 */
export function setCookie<T = any>(
  name: CookieKey,
  value: T,
  options: CookieOptions = {}
): boolean {
  if (!isBrowser() || !name) return false

  // 1. Consent Policy Enforcement Check
  if (!isCookieAllowedByConsent(name)) {
    console.warn(
      `[Privacy Guard] Cookie "${name}" blocked because category "${
        COOKIE_REGISTRY[name]?.category || "functional"
      }" has not been consented to by the user.`
    )
    return false
  }

  // 2. Format Value
  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
  const cleanName = name.replace(/[\r\n]/g, "").trim()
  const cleanValue = encodeURIComponent(stringValue.replace(/[\r\n]/g, ""))

  // 3. Resolve Security Options
  const def = COOKIE_REGISTRY[cleanName]
  const maxAge = options.maxAge !== undefined ? options.maxAge : def?.defaultMaxAge
  const path = options.path || "/"
  const secure = options.secure !== undefined ? options.secure : (isHttps() || def?.secureOnly)
  const sameSite = options.sameSite || def?.sameSiteDefault || "Lax"

  const parts: string[] = [`${cleanName}=${cleanValue}`]

  if (maxAge !== undefined && !isNaN(maxAge)) {
    parts.push(`Max-Age=${Math.floor(maxAge)}`)
    const expiresDate = new Date(Date.now() + maxAge * 1000)
    parts.push(`Expires=${expiresDate.toUTCString()}`)
  } else if (options.expires) {
    const exp = typeof options.expires === "string" ? new Date(options.expires) : options.expires
    if (!isNaN(exp.getTime())) {
      parts.push(`Expires=${exp.toUTCString()}`)
    }
  }

  if (path) {
    parts.push(`Path=${path}`)
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`)
  }

  if (secure) {
    parts.push("Secure")
  }

  if (sameSite) {
    const capSameSite =
      sameSite.toLowerCase() === "strict"
        ? "Strict"
        : sameSite.toLowerCase() === "none"
        ? "None"
        : "Lax"
    parts.push(`SameSite=${capSameSite}`)
  }

  if (options.partitioned) {
    parts.push("Partitioned")
  }

  const cookieString = parts.join("; ")

  // 4. Size Guard
  if (cookieString.length > MAX_COOKIE_BYTES) {
    console.error(
      `[Security Error] Cookie "${cleanName}" exceeds 4096 bytes (${cookieString.length} bytes). Refusing to set to avoid HTTP 431.`
    )
    return false
  }

  // 5. Write to document
  document.cookie = cookieString
  return true
}

/**
 * Removes a cookie by expiring it immediately.
 */
export function removeCookie(name: CookieKey, options: CookieOptions = {}): void {
  if (!isBrowser() || !name) return

  const cleanName = name.replace(/[\r\n]/g, "").trim()
  const path = options.path || "/"
  const domain = options.domain ? `; Domain=${options.domain}` : ""

  document.cookie = `${cleanName}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}${domain}`
}

/**
 * Purges any non-consented cookies when consent preferences change.
 */
function purgeDisallowedCookies(consent: ConsentState): void {
  Object.values(COOKIE_REGISTRY).forEach((def) => {
    if (def.category !== "necessary" && !consent[def.category]) {
      removeCookie(def.name)
    }
  })
}

/**
 * Dispatches a custom event on window so React hooks and listeners update reactively.
 */
function dispatchConsentEvent(consent: ConsentState): void {
  if (!isBrowser()) return
  const event = new CustomEvent<ConsentState>(CONSENT_EVENT_NAME, { detail: consent })
  window.dispatchEvent(event)
}

/**
 * Updates consent preferences, purges disallowed cookies, and dispatches change events.
 */
export function updateConsentPreferences(
  preferences: Partial<ConsentPreferences>
): ConsentState {
  const updatedState: ConsentState = {
    necessary: true,
    functional: preferences.functional ?? false,
    analytics: preferences.analytics ?? false,
    marketing: preferences.marketing ?? false,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  }

  // Write consent record directly (consent cookie is strictly necessary)
  const consentString = JSON.stringify(updatedState)
  const cleanName = CONSENT_COOKIE_KEY
  const secure = isHttps()
  document.cookie = `${cleanName}=${encodeURIComponent(
    consentString
  )}; Max-Age=${365 * 86400}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`

  // Purge any cookies that are now disallowed
  purgeDisallowedCookies(updatedState)

  // Notify listeners
  dispatchConsentEvent(updatedState)

  return updatedState
}

/**
 * Accepts all cookie categories.
 */
export function acceptAllConsent(): ConsentState {
  return updateConsentPreferences({
    functional: true,
    analytics: true,
    marketing: true,
  })
}

/**
 * Rejects all optional cookie categories (keeps strictly necessary only).
 */
export function rejectNonEssentialConsent(): ConsentState {
  return updateConsentPreferences({
    functional: false,
    analytics: false,
    marketing: false,
  })
}

/**
 * Resets consent state (for debugging / re-triggering banner).
 */
export function resetConsent(): void {
  if (!isBrowser()) return
  removeCookie(CONSENT_COOKIE_KEY)
  const event = new CustomEvent(CONSENT_EVENT_NAME, { detail: null })
  window.dispatchEvent(event)
}

/**
 * Subscribes a listener callback to consent changes.
 */
export function onConsentChange(callback: (consent: ConsentState | null) => void): () => void {
  if (!isBrowser()) return () => {}

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<ConsentState | null>
    callback(customEvent.detail || null)
  }

  window.addEventListener(CONSENT_EVENT_NAME, handler)
  return () => window.removeEventListener(CONSENT_EVENT_NAME, handler)
}
