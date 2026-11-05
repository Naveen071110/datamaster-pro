import { useState, useCallback } from "react"

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return initialValue
      }
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`[useLocalStorage] Unable to read key "${key}" from localStorage:`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(key, JSON.stringify(next))
          }
        } catch (error) {
          console.warn(`[useLocalStorage] Storage failed for key "${key}" (quota exceeded or storage blocked):`, error)
        }
        return next
      })
    },
    [key]
  )

  return [storedValue, setValue]
}
