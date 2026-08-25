/**
 * Enterprise Cookie Consent Banner & Granular Preferences Modal
 * Compliant with GDPR, ePrivacy, and WCAG accessibility standards.
 */

import { useState, useEffect } from "react"
import {
  ShieldCheck,
  Lock,
  SlidersHorizontal,
  X,
  Check,
  Cookie,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { useConsent } from "@/lib/cookies/useConsent"
import { CATEGORY_INFO } from "@/lib/cookies/config"
import type { CookieCategory } from "@/lib/cookies/types"

export function CookieBanner() {
  const {
    consent,
    hasResponded,
    isReady,
    isModalOpen,
    openModal,
    closeModal,
    updateConsent,
    acceptAll,
    rejectNonEssential,
  } = useConsent()

  // Local state for customized modal choices
  const [customChoices, setCustomChoices] = useState({
    functional: false,
    analytics: false,
    marketing: false,
  })

  // Sync custom choices whenever consent loads or modal opens
  useEffect(() => {
    if (consent) {
      setCustomChoices({
        functional: consent.functional,
        analytics: consent.analytics,
        marketing: consent.marketing,
      })
    } else {
      setCustomChoices({
        functional: true,
        analytics: false,
        marketing: false,
      })
    }
  }, [consent, isModalOpen])

  // Prevent flash before client-side hydration
  if (!isReady) return null

  // If user already responded and modal is not explicitly opened, render nothing
  if (hasResponded && !isModalOpen) {
    return null
  }

  const handleToggle = (cat: "functional" | "analytics" | "marketing") => {
    setCustomChoices((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const handleSaveCustom = () => {
    updateConsent({
      functional: customChoices.functional,
      analytics: customChoices.analytics,
      marketing: customChoices.marketing,
    })
  }

  return (
    <>
      {/* 1. Non-Intrusive Floating Banner (Shown only if user has not yet responded) */}
      {!hasResponded && !isModalOpen && (
        <aside
          aria-label="Cookie consent options"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="rounded-2xl border border-border/80 dark:border-white/20 bg-background/95 dark:bg-[#121212]/95 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl shadow-black/50 text-foreground dark:text-white space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl border border-primary/20 bg-primary/10 text-primary dark:text-white shrink-0 mt-0.5">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground dark:text-white">
                    Privacy &amp; Cookie Preferences
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    GDPR Compliant
                  </span>
                </div>
                <p className="text-xs text-muted-foreground dark:text-white/70 leading-relaxed">
                  We use cookies to maintain your encrypted session, store IDE workspace preferences, and measure query performance. Strictly necessary cookies are active by default.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={acceptAll}
                className="flex-1 sm:flex-initial rounded-xl bg-foreground dark:bg-white px-4 py-2 text-xs font-semibold text-background dark:text-black hover:opacity-90 transition-all duration-200 shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Accept All</span>
              </button>

              <button
                type="button"
                onClick={rejectNonEssential}
                className="flex-1 sm:flex-initial rounded-xl border border-border dark:border-white/20 bg-muted/50 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 px-4 py-2 text-xs font-medium text-foreground dark:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <span>Essential Only</span>
              </button>

              <button
                type="button"
                onClick={openModal}
                className="w-full sm:w-auto rounded-xl border border-transparent hover:border-border dark:hover:border-white/15 px-3 py-2 text-xs font-medium text-muted-foreground dark:text-white/70 hover:text-foreground dark:hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Customize</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Granular Settings Modal / Drawer */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border/80 dark:border-white/20 bg-background dark:bg-[#0f0f0f] shadow-2xl overflow-hidden text-foreground dark:text-white flex flex-col max-h-[90vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary dark:text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 id="cookie-settings-title" className="text-base font-bold tracking-tight">
                    Cookie &amp; State Management Settings
                  </h2>
                  <p className="text-xs text-muted-foreground dark:text-white/60">
                    Granular privacy controls &amp; OWASP defense-in-depth compliance
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close cookie settings modal"
                className="p-1.5 rounded-lg text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Categories List */}
            <div className="px-6 py-5 overflow-y-auto space-y-4 text-xs">
              <p className="text-muted-foreground dark:text-white/70 leading-relaxed">
                Configure your cookie preferences below. Strictly necessary cookies are required for platform security and anonymous workspace retention, while optional categories can be toggled per your preference.
              </p>

              <div className="space-y-3">
                {/* 1. Strictly Necessary */}
                <div className="rounded-xl border border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-sm">Strictly Necessary</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold uppercase">
                        Always Active
                      </span>
                    </div>
                    <div className="h-5 w-9 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-end px-1 cursor-not-allowed opacity-80">
                      <div className="h-3.5 w-3.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <p className="text-muted-foreground dark:text-white/60 leading-relaxed">
                    {CATEGORY_INFO.necessary.description} (Includes: <code>app_session_token</code>, <code>csrf_token</code>, <code>guest_session_id</code>).
                  </p>
                </div>

                {/* 2. Functional & Preferences */}
                <div className="rounded-xl border border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-sky-400" />
                      <span className="font-semibold text-sm">Functional &amp; Workspace Preferences</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-400 uppercase">
                        Configurable
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={customChoices.functional}
                      onClick={() => handleToggle("functional")}
                      className={`h-5 w-9 rounded-full border transition-colors flex items-center px-0.5 ${
                        customChoices.functional
                          ? "bg-sky-500 border-sky-400 justify-end"
                          : "bg-muted dark:bg-white/10 border-border dark:border-white/20 justify-start"
                      }`}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full shadow-sm ${customChoices.functional ? "bg-white" : "bg-muted-foreground dark:bg-white/60"}`} />
                    </button>
                  </div>
                  <p className="text-muted-foreground dark:text-white/60 leading-relaxed">
                    {CATEGORY_INFO.functional.description} (Includes: <code>app_theme</code>, <code>app_workspace_prefs</code>).
                  </p>
                </div>

                {/* 3. Performance & Analytics */}
                <div className="rounded-xl border border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cookie className="h-4 w-4 text-purple-400" />
                      <span className="font-semibold text-sm">Performance &amp; Analytics</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase">
                        Opt-In
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={customChoices.analytics}
                      onClick={() => handleToggle("analytics")}
                      className={`h-5 w-9 rounded-full border transition-colors flex items-center px-0.5 ${
                        customChoices.analytics
                          ? "bg-purple-500 border-purple-400 justify-end"
                          : "bg-muted dark:bg-white/10 border-border dark:border-white/20 justify-start"
                      }`}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full shadow-sm ${customChoices.analytics ? "bg-white" : "bg-muted-foreground dark:bg-white/60"}`} />
                    </button>
                  </div>
                  <p className="text-muted-foreground dark:text-white/60 leading-relaxed">
                    {CATEGORY_INFO.analytics.description} (Includes: <code>analytics_session_id</code>).
                  </p>
                </div>

                {/* 4. Marketing & Referrals */}
                <div className="rounded-xl border border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-amber-400" />
                      <span className="font-semibold text-sm">Marketing &amp; Referrals</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 uppercase">
                        Opt-In
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={customChoices.marketing}
                      onClick={() => handleToggle("marketing")}
                      className={`h-5 w-9 rounded-full border transition-colors flex items-center px-0.5 ${
                        customChoices.marketing
                          ? "bg-amber-500 border-amber-400 justify-end"
                          : "bg-muted dark:bg-white/10 border-border dark:border-white/20 justify-start"
                      }`}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full shadow-sm ${customChoices.marketing ? "bg-white" : "bg-muted-foreground dark:bg-white/60"}`} />
                    </button>
                  </div>
                  <p className="text-muted-foreground dark:text-white/60 leading-relaxed">
                    {CATEGORY_INFO.marketing.description} (Includes: <code>ref_source</code>).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="text-xs text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white underline underline-offset-4 transition-colors"
              >
                Reject Non-Essential
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-xl border border-border dark:border-white/20 bg-muted/50 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 px-4 py-2 text-xs font-medium text-foreground dark:text-white transition-all"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="rounded-xl bg-foreground dark:bg-white px-5 py-2 text-xs font-semibold text-background dark:text-black hover:opacity-90 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
