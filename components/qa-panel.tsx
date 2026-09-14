"use client"

import type React from "react"
import { useState } from "react"
import { CornerDownLeft, FileText, Loader2, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Answer } from "@/lib/rag"

type QaPanelProps = {
  answer: Answer | null
  asking: boolean
  hasDocuments: boolean
  onAsk: (question: string) => void
}

const SUGGESTIONS = [
  "Summarize the key points",
  "What are the main conclusions?",
  "List any important dates",
]

export function QaPanel({ answer, asking, hasDocuments, onAsk }: QaPanelProps) {
  const [question, setQuestion] = useState("")

  function submit() {
    const trimmed = question.trim()
    if (!trimmed || asking) return
    onAsk(trimmed)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <section aria-labelledby="qa-heading" className="flex h-full flex-col">
      <div className="mb-4">
        <h2 id="qa-heading" className="text-sm font-semibold text-foreground">
          Ask a question
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Answers are grounded in your indexed documents.
        </p>
      </div>

      {/* Question input */}
      <div className="rounded-xl border border-border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={
            hasDocuments
              ? "Ask anything about your documents..."
              : "Add a document first, then ask a question..."
          }
          className="w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <CornerDownLeft className="size-3" aria-hidden="true" />
            Enter to send · Shift+Enter for newline
          </span>
          <Button size="sm" onClick={submit} disabled={!question.trim() || asking} className="ml-auto">
            {asking ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Searching
              </>
            ) : (
              <>
                <Search aria-hidden="true" />
                Ask
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      {!answer && !asking && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuestion(s)}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Answer area */}
      <div className="mt-5 flex-1 overflow-y-auto">
        {asking ? (
          <AnswerSkeleton />
        ) : answer ? (
          <AnswerView answer={answer} />
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sparkles className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">Ready when you are</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground text-pretty">
        Ask a question and the retrieved answer will appear here, along with the source passages it
        was grounded in.
      </p>
    </div>
  )
}

function AnswerSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-[92%] animate-pulse rounded bg-muted" />
        <div className="h-3 w-[78%] animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

function AnswerView({ answer }: { answer: Answer }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          Answer
        </div>
        <div className="mt-2 rounded-xl border border-border bg-card p-4">
          <p className="text-sm leading-relaxed text-foreground text-pretty">{answer.text}</p>
        </div>
      </div>

      {answer.sources.length > 0 && (
        <div>
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Sources · {answer.sources.length}
          </div>
          <ol className="mt-2 space-y-2">
            {answer.sources.map((source, i) => (
              <li
                key={source.id}
                className="rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold tabular-nums text-primary">
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground">
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate" title={source.documentName}>
                        {source.documentName}
                      </span>
                    </span>
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {(source.score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="mt-2 border-l-2 border-border pl-3 text-xs leading-relaxed text-muted-foreground text-pretty">
                  {source.snippet}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
