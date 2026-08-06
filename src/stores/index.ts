import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Bookmark, QueryTab, QueryHistoryEntry } from "@/shared/types/store"
import { STORAGE_KEYS } from "@/shared/utils/constants"

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

interface UiSlice {
  sidebarOpen: boolean
  theme: "dark" | "light"
  mobileNavOpen: boolean
  toggleSidebar: () => void
  setTheme: (theme: "dark" | "light") => void
  toggleTheme: () => void
  setMobileNavOpen: (open: boolean) => void
}

interface SqlSandboxSlice {
  queryTabs: QueryTab[]
  activeTabId: string | null
  queryHistory: QueryHistoryEntry[]
  databaseReady: boolean
  databaseError: string | null
  addTab: () => string
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTabSql: (id: string, sql: string) => void
  setTabResult: (id: string, result: QueryTab["result"]) => void
  setTabError: (id: string, error: string) => void
  setTabExecuting: (id: string, executing: boolean) => void
  setTabExecutionTime: (id: string, ms: number) => void
  addToHistory: (entry: QueryHistoryEntry) => void
  clearResults: (id: string) => void
  setDatabaseReady: (ready: boolean) => void
  setDatabaseError: (error: string | null) => void
}

interface BookmarksSlice {
  bookmarks: Bookmark[]
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void
  removeBookmark: (targetId: string, type: string) => void
  isBookmarked: (targetId: string, type: string) => boolean
  getBookmarksByType: (type: string) => Bookmark[]
}

interface TroubleshootingSlice {
  troubleHistory: Record<string, string[]>
  setNodePath: (scenarioId: string, path: string[]) => void
  resetPath: (scenarioId: string) => void
}

interface HomeSlice {
  pageVisits: Record<string, number>
  incrementPageVisit: (page: string) => void
  getPageVisits: () => Record<string, number>
}

export type AppStore = UiSlice & SqlSandboxSlice & BookmarksSlice & TroubleshootingSlice & HomeSlice

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // UI Slice
      sidebarOpen: true,
      theme: "dark",
      mobileNavOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

      // SQL Sandbox Slice
      queryTabs: [],
      activeTabId: null,
      queryHistory: [],
      databaseReady: false,
      databaseError: null,
      addTab: () => {
        const id = generateId()
        const count = get().queryTabs.length + 1
        const tab: QueryTab = {
          id,
          name: `Query ${count}`,
          sql: "",
          isExecuting: false,
        }
        set((s) => ({
          queryTabs: [...s.queryTabs, tab],
          activeTabId: id,
        }))
        return id
      },
      closeTab: (id) =>
        set((s) => {
          const tabs = s.queryTabs.filter((t) => t.id !== id)
          let activeId = s.activeTabId
          if (activeId === id) {
            activeId = tabs.length > 0 ? tabs[tabs.length - 1].id : null
          }
          return { queryTabs: tabs, activeTabId: activeId }
        }),
      setActiveTab: (id) => set({ activeTabId: id }),
      updateTabSql: (id, sql) =>
        set((s) => ({
          queryTabs: s.queryTabs.map((t) => (t.id === id ? { ...t, sql } : t)),
        })),
      setTabResult: (id, result) =>
        set((s) => ({
          queryTabs: s.queryTabs.map((t) =>
            t.id === id ? { ...t, result, error: undefined } : t
          ),
        })),
      setTabError: (id, error) =>
        set((s) => ({
          queryTabs: s.queryTabs.map((t) =>
            t.id === id ? { ...t, error, result: undefined } : t
          ),
        })),
      setTabExecuting: (id, executing) =>
        set((s) => ({
          queryTabs: s.queryTabs.map((t) =>
            t.id === id ? { ...t, isExecuting: executing } : t
          ),
        })),
      setTabExecutionTime: (id, ms) =>
        set((s) => ({
          queryTabs: s.queryTabs.map((t) =>
            t.id === id ? { ...t, executionTimeMs: ms } : t
          ),
        })),
      addToHistory: (entry) =>
        set((s) => ({
          queryHistory: [entry, ...s.queryHistory].slice(0, 50),
        })),
      clearResults: (id) =>
        set((s) => ({
          queryTabs: s.queryTabs.map((t) =>
            t.id === id
              ? { ...t, result: undefined, error: undefined, executionTimeMs: undefined }
              : t
          ),
        })),
      setDatabaseReady: (ready) => set({ databaseReady: ready }),
      setDatabaseError: (error) => set({ databaseError: error }),

      // Bookmarks Slice
      bookmarks: [],
      addBookmark: (bookmark) =>
        set((s) => ({
          bookmarks: [
            ...s.bookmarks,
            {
              ...bookmark,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeBookmark: (targetId, type) =>
        set((s) => ({
          bookmarks: s.bookmarks.filter(
            (b) => !(b.targetId === targetId && b.type === type)
          ),
        })),
      isBookmarked: (targetId, type) =>
        get().bookmarks.some((b) => b.targetId === targetId && b.type === type),
      getBookmarksByType: (type) =>
        get().bookmarks.filter((b) => b.type === type),

      // Troubleshooting Slice
      troubleHistory: {},
      setNodePath: (scenarioId, path) =>
        set((s) => ({
          troubleHistory: { ...s.troubleHistory, [scenarioId]: path },
        })),
      resetPath: (scenarioId) =>
        set((s) => {
          const { [scenarioId]: _, ...rest } = s.troubleHistory
          return { troubleHistory: rest }
        }),

      // Home Slice
      pageVisits: {},
      incrementPageVisit: (page) =>
        set((s) => ({
          pageVisits: {
            ...s.pageVisits,
            [page]: (s.pageVisits[page] || 0) + 1,
          },
        })),
      getPageVisits: () => get().pageVisits,
    }),
    {
      name: "datamaster-pro-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        queryTabs: state.queryTabs,
        queryHistory: state.queryHistory,
        activeTabId: state.activeTabId,
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        troubleHistory: state.troubleHistory,
        pageVisits: state.pageVisits,
      }),
    }
  )
)
