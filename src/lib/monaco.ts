import { loader } from "@monaco-editor/react"

/**
 * Configure Monaco Editor to load production minified assets from CDN
 */
export function initMonacoConfig() {
  loader.config({
    paths: {
      vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
    },
  })
}

initMonacoConfig()
