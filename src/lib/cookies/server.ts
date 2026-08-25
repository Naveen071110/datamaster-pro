/**
 * Universal Server-Side Cookie Engine
 * Compatible with Node.js, Express, Edge runtimes, and Cloudflare Workers.
 */

import type { CookieOptions, SameSiteOption } from "./types"
import { COOKIE_REGISTRY, MAX_COOKIE_BYTES } from "./config"

/**
 * Validates that names or values do not contain CRLF characters (Header Injection protection)
 */
function sanitizeHeaderString(str: string): string {
  return str.replace(/[\r\n]/g, "")
}

/**
 * Serializes a cookie name, value, and options into a standard `Set-Cookie` header string.
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const cleanName = sanitizeHeaderString(name.trim())
  const cleanValue = sanitizeHeaderString(encodeURIComponent(value))

  const def = COOKIE_REGISTRY[cleanName]
  const maxAge = options.maxAge !== undefined ? options.maxAge : def?.defaultMaxAge
  const path = options.path || "/"
  const secure = options.secure !== undefined ? options.secure : def?.secureOnly ?? true
  const httpOnly = options.httpOnly !== undefined ? options.httpOnly : def?.isServerOnly ?? false
  const sameSite: SameSiteOption = options.sameSite || def?.sameSiteDefault || "Lax"

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
    parts.push(`Domain=${sanitizeHeaderString(options.domain)}`)
  }

  if (secure) {
    parts.push("Secure")
  }

  if (httpOnly) {
    parts.push("HttpOnly")
  }

  if (sameSite) {
    const capitalizedSameSite =
      sameSite.toLowerCase() === "strict"
        ? "Strict"
        : sameSite.toLowerCase() === "none"
        ? "None"
        : "Lax"
    parts.push(`SameSite=${capitalizedSameSite}`)
  }

  if (options.partitioned) {
    parts.push("Partitioned")
  }

  if (options.priority) {
    const capPriority = options.priority.charAt(0).toUpperCase() + options.priority.slice(1).toLowerCase()
    parts.push(`Priority=${capPriority}`)
  }

  const cookieString = parts.join("; ")

  if (cookieString.length > MAX_COOKIE_BYTES) {
    console.warn(
      `[Security Warning] Cookie "${cleanName}" exceeds 4096 bytes (${cookieString.length} bytes). Truncation or HTTP 431 may occur.`
    )
  }

  return cookieString
}

/**
 * Parses raw `Cookie` HTTP request header into a key-value record.
 */
export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader || typeof cookieHeader !== "string") {
    return {}
  }

  const result: Record<string, string> = {}
  const pairs = cookieHeader.split(";")

  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=")
    if (eqIdx === -1) continue

    const key = pair.substring(0, eqIdx).trim()
    const val = pair.substring(eqIdx + 1).trim()

    if (!key) continue

    try {
      result[key] = decodeURIComponent(val)
    } catch {
      result[key] = val // Fallback if URI malformed
    }
  }

  return result
}

/**
 * Generates standard Set-Cookie string to delete a cookie.
 */
export function createClearCookie(name: string, options: CookieOptions = {}): string {
  return serializeCookie(name, "", {
    ...options,
    maxAge: 0,
    expires: new Date(0),
    path: options.path || "/",
  })
}

/**
 * Enterprise Auth Session Cookie Generator (JWT / Session token).
 * Configured with OWASP HttpOnly, Secure, Lax/Strict flags.
 */
export function createAuthCookie(
  token: string,
  durationSeconds: number = 14 * 86400,
  useHostPrefix: boolean = false
): { name: string; value: string; cookieString: string } {
  const cookieName = useHostPrefix ? "__Host-app_session_token" : "app_session_token"
  const cookieString = serializeCookie(cookieName, token, {
    maxAge: durationSeconds,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
  })

  return { name: cookieName, value: token, cookieString }
}

/**
 * Enterprise CSRF Double-Submit Token Cookie Generator.
 * Accessible to client JS for custom header binding, with Strict SameSite and Secure flags.
 */
export function createCsrfCookie(
  csrfToken: string,
  durationSeconds: number = 86400
): { name: string; value: string; cookieString: string } {
  const cookieName = "csrf_token"
  const cookieString = serializeCookie(cookieName, csrfToken, {
    maxAge: durationSeconds,
    httpOnly: false,
    secure: true,
    sameSite: "Strict",
    path: "/",
  })

  return { name: cookieName, value: csrfToken, cookieString }
}
