/**
 * Reactive useCookie Hook
 * Provides stateful access to cookies with automatic synchronization and consent checking.
 */

import { useState, useEffect, useCallback } from "react"
import type { CookieKey, CookieOptions } from "./types"
import { getCookie, setCookie, removeCookie, onConsentChange } from "./client"

export function useCookie<T = string>(
  name: CookieKey,
  initialValue?: T,
  options?: CookieOptions
): [
  value: T | null,
  updateCookie: (newValue: T, customOptions?: CookieOptions) => boolean,
  deleteCookie: (customOptions?: CookieOptions) => void
] {
  const [cookieVal, setCookieVal] = useState<T | null>(() => {
    const existing = getCookie<T>(name)
    if (existing !== null) return existing
    return initialValue !== undefined ? initialValue : null
  })

  // Synchronize on mount and when consent changes
  useEffect(() => {
    const current = getCookie<T>(name)
    if (current !== null) {
      setCookieVal(current)
    } else if (initialValue !== undefined) {
      setCookieVal(initialValue)
    } else {
      setCookieVal(null)
    }

    // Re-check when user modifies consent
    const unsubscribe = onConsentChange(() => {
      const updated = getCookie<T>(name)
      setCookieVal(updated !== null ? updated : initialValue !== undefined ? initialValue : null)
    })

    return unsubscribe
  }, [name, initialValue])

  const updateCookie = useCallback(
    (newValue: T, customOptions?: CookieOptions): boolean => {
      const mergedOptions = { ...options, ...customOptions }
      const success = setCookie(name, newValue, mergedOptions)
      if (success) {
        setCookieVal(newValue)
      }
      return success
    },
    [name, options]
  )

  const deleteCookie = useCallback(
    (customOptions?: CookieOptions): void => {
      const mergedOptions = { ...options, ...customOptions }
      removeCookie(name, mergedOptions)
      setCookieVal(null)
    },
    [name, options]
  )

  return [cookieVal, updateCookie, deleteCookie]
}
