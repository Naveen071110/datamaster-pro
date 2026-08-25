/**
 * Reactive useConsent Hook
 * Connects UI components to the GDPR / ePrivacy consent state and modal controls.
 */

import { useState, useEffect, useCallback } from "react"
import type { ConsentState, ConsentPreferences } from "./types"
import {
  getConsentPreferences,
  hasUserRespondedToConsent,
  updateConsentPreferences,
  acceptAllConsent,
  rejectNonEssentialConsent,
  resetConsent as resetConsentUtil,
  onConsentChange,
} from "./client"

// Global modal trigger event for opening the cookie settings modal from anywhere (e.g. footer button)
const OPEN_COOKIE_MODAL_EVENT = "datamaster:open-cookie-modal"

export function triggerOpenCookieModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_MODAL_EVENT))
  }
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Initial read after mount (guarantees zero hydration mismatch)
    setConsent(getConsentPreferences())
    setIsReady(true)

    // Listen for consent preference changes
    const unsubConsent = onConsentChange((newConsent) => {
      setConsent(newConsent)
    })

    // Listen for global open modal requests (e.g. from footer link)
    const handleOpenModal = () => setIsModalOpen(true)
    window.addEventListener(OPEN_COOKIE_MODAL_EVENT, handleOpenModal)

    return () => {
      unsubConsent()
      window.removeEventListener(OPEN_COOKIE_MODAL_EVENT, handleOpenModal)
    }
  }, [])

  const update = useCallback((prefs: Partial<ConsentPreferences>) => {
    const updated = updateConsentPreferences(prefs)
    setConsent(updated)
    setIsModalOpen(false)
    return updated
  }, [])

  const acceptAll = useCallback(() => {
    const updated = acceptAllConsent()
    setConsent(updated)
    setIsModalOpen(false)
    return updated
  }, [])

  const rejectNonEssential = useCallback(() => {
    const updated = rejectNonEssentialConsent()
    setConsent(updated)
    setIsModalOpen(false)
    return updated
  }, [])

  const reset = useCallback(() => {
    resetConsentUtil()
    setConsent(null)
  }, [])

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  return {
    consent,
    hasResponded: consent !== null,
    isReady,
    isModalOpen,
    openModal,
    closeModal,
    updateConsent: update,
    acceptAll,
    rejectNonEssential,
    resetConsent: reset,
  }
}
