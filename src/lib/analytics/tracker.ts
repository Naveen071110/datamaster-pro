/**
 * Privacy-First Analytics & Telemetry Engine for DataMaster Pro
 *
 * GDPR / ePrivacy Compliant:
 * - Strictly respects user consent choices from the Cookie Architecture.
 * - Only sets `analytics_session_id` and tracks metrics if `consent.analytics === true`.
 * - Operates first-party by default with optional GA4 / Cloudflare Web Analytics adapters.
 */

import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { getConsentPreferences, getCookie, setCookie, isBrowser } from "@/lib/cookies/client"
import { useAppStore } from "@/stores"

// Extend Window interface for optional Google Analytics / Telemetry integrations
declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

export interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  timestamp: string
  path: string
}

/** Check if analytics tracking is legally permitted by the user */
export function isAnalyticsPermitted(): boolean {
  if (!isBrowser()) return false
  const consent = getConsentPreferences()
  return !!consent?.analytics
}

/** Ensure analytics session cookie exists when consented */
export function ensureAnalyticsSession(): string | null {
  if (!isAnalyticsPermitted()) return null

  let sessionId = getCookie("analytics_session_id")
  if (!sessionId) {
    sessionId = `as_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`
    setCookie("analytics_session_id", sessionId, {
      maxAge: 90 * 86400, // 90 days
      path: "/",
      sameSite: "Lax",
    })
  }
  return sessionId
}

/** Track page views across routes */
export function trackPageView(path: string, title?: string): void {
  if (!isBrowser()) return

  // Always update in-app local visit counters (100% private, client-side only)
  const pageName = path === "/" ? "home" : path.replace(/^\//, "")
  try {
    useAppStore.getState().incrementPageVisit(pageName)
  } catch {
    // Store might not be mounted in test environments
  }

  // Only proceed with remote or cookie-based telemetry if user explicitly opted in
  if (!isAnalyticsPermitted()) {
    return
  }

  ensureAnalyticsSession()
  const pageTitle = title || document.title

  // 1. Google Analytics 4 (if configured via tag or environment)
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: pageTitle,
    })
  }

  // 2. Dispatch custom event for extensible third-party listeners
  window.dispatchEvent(
    new CustomEvent("datamaster:analytics:page_view", {
      detail: { path, title: pageTitle, timestamp: new Date().toISOString() },
    })
  )
}

/** Track custom user actions (e.g. running an SQL query, synthesizing DDL) */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (!isBrowser() || !isAnalyticsPermitted()) {
    return
  }

  ensureAnalyticsSession()

  const eventData: AnalyticsEvent = {
    category,
    action,
    label,
    value,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }

  window.dispatchEvent(
    new CustomEvent("datamaster:analytics:event", {
      detail: eventData,
    })
  )
}

/**
 * React hook to automatically trigger pageview tracking on route changes
 */
export function useAnalyticsTracker(): void {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
}
