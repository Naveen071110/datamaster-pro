import { useRef, useCallback, memo } from "react"
import Editor from "@monaco-editor/react"
import { useTheme } from "@/shared/hooks/useTheme"

interface QueryEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  height?: string
}

export const QueryEditor = memo(function QueryEditor({
  value,
  onChange,
  onExecute,
  height = "200px",
}: QueryEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<any>(null)

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor
    editor.focus()

    editor.addAction({
      id: "execute-query",
      label: "Execute Query",
      keybindings: [2048 | 13], // Cmd+Enter
      run: () => {
        onExecute()
      },
    })
  }, [onExecute])

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="sql"
        theme={theme === "dark" ? "vs-dark" : "vs"}
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 8 },
          suggestOnTriggerCharacters: true,
          bracketPairColorization: { enabled: true },
          automaticLayout: true,
          tabSize: 2,
          renderWhitespace: "selection",
        }}
      />
    </div>
  )
})
