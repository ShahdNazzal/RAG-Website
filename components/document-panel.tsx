"use client"

// C:\Users\lenovo\Desktop\MINI-RAG-FRONTEND\components\document-panel.tsx

import type React from "react"
import { useRef, useState } from "react"
import { FileText, Loader2, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RagDocument } from "@/lib/rag"

type DocumentPanelProps = {
  documents: RagDocument[]
  ingesting: boolean
  onIngest: (file: File) => void
  onRemove: (id: string) => void
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

export function DocumentPanel({ documents, ingesting, onIngest, onRemove }: DocumentPanelProps) {
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function submitText() {
    const trimmed = content.trim()
    if (!trimmed || ingesting) return
    const fileName = name.trim() ? `${name.trim()}.txt` : `note-${Date.now()}.txt`
    const file = new File([trimmed], fileName, { type: "text/plain" })
    onIngest(file)
    setName("")
    setContent("")
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file instanceof File) onIngest(file)
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file instanceof File) onIngest(file)
    e.target.value = ""
  }

  return (
    <section aria-labelledby="documents-heading" className="flex h-full flex-col">
      <div className="mb-4">
        <h2 id="documents-heading" className="text-sm font-semibold text-foreground">
          Knowledge base
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Upload company documents to index for retrieval.</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border border-dashed border-border bg-muted/30 p-3 transition-colors",
          dragging && "border-primary/60 bg-primary/5",
        )}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Document title (optional, for pasted text)"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste text here, or drop a file (PDF, TXT...) below..."
          rows={5}
          className="mt-2 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" onClick={submitText} disabled={!content.trim() || ingesting}>
            {ingesting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Indexing
              </>
            ) : (
              <>
                <Plus aria-hidden="true" />
                Add to index
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={ingesting}>
            <Upload aria-hidden="true" />
            Upload file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown,.pdf,text/plain,application/pdf"
            className="sr-only"
            onChange={onFileInputChange}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Indexed</h3>
        <span className="text-xs tabular-nums text-muted-foreground">{documents.length}</span>
      </div>

      <div className="mt-2 flex-1 space-y-2 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-4 py-8 text-center">
            <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
            <p className="mt-2 text-xs text-muted-foreground text-pretty">No documents indexed yet.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20"
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground" title={doc.name}>
                  {doc.name}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {doc.chunks > 0 ? `${doc.chunks} chunk${doc.chunks > 1 ? "s" : ""}` : "Still processing…"} ·{" "}
                  {formatSize(doc.chars)}
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Remove ${doc.name}`}
                onClick={() => onRemove(doc.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}