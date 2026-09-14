"use client"

// C:\Users\lenovo\Desktop\MINI-RAG-FRONTEND\components\rag-app.tsx

import { useState } from "react"
import { Database, Sparkles } from "lucide-react"
import { DocumentPanel } from "@/components/document-panel"
import { QaPanel } from "@/components/qa-panel"
import { HrAccessGate } from "@/components/hr-access-gate"
import { askQuestion, ingestDocument, removeDocument, type Answer, type RagDocument } from "@/lib/rag"

export function RagApp() {
  const [documents, setDocuments] = useState<RagDocument[]>([])
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [ingesting, setIngesting] = useState(false)
  const [asking, setAsking] = useState(false)
  const [hrAuthenticated, setHrAuthenticated] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleIngest(file: File) {
    setIngesting(true)
    setUploadError(null)
    try {
      const doc = await ingestDocument(file)
      setDocuments((prev) => [doc, ...prev])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء رفع الملف")
    } finally {
      setIngesting(false)
    }
  }

  async function handleRemove(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    await removeDocument(id)
  }

  async function handleAsk(question: string) {
    setAsking(true)
    setAnswer(null)
    try {
      const result = await askQuestion(question)
      setAnswer(result)
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-6 md:py-8">
      <header className="flex items-center gap-3 border-b border-border pb-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Database className="size-4.5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">RAG</h1>
          <p className="text-xs text-muted-foreground">AI Knowledge Assistant for your organization</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {hrAuthenticated && (
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {documents.length} document{documents.length === 1 ? "" : "s"} indexed
            </div>
          )}
          <HrAccessGate
            isAuthenticated={hrAuthenticated}
            onAuthenticate={() => setHrAuthenticated(true)}
            onLogout={() => setHrAuthenticated(false)}
          />
        </div>
      </header>

      {hrAuthenticated ? (
        <main className="grid flex-1 gap-6 pt-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8">
          <div className="md:border-r md:border-border md:pr-6 lg:pr-8">
            {uploadError && (
              <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {uploadError}
              </div>
            )}
            <DocumentPanel
              documents={documents}
              ingesting={ingesting}
              onIngest={handleIngest}
              onRemove={handleRemove}
            />
          </div>
          <QaPanel answer={answer} asking={asking} hasDocuments={documents.length > 0} onAsk={handleAsk} />
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center pt-10">
          <div className="mb-8 flex max-w-lg flex-col items-center text-center">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-foreground">Ask your company's knowledge assistant</h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Get answers grounded in your company's policies, handbooks, and internal documentation.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <QaPanel answer={answer} asking={asking} hasDocuments onAsk={handleAsk} />
          </div>
        </main>
      )}
    </div>
  )
}