"use client"

// C:\Users\lenovo\Desktop\MINI-RAG-FRONTEND\components\hr-access-gate.tsx

import { useState } from "react"
import { Lock, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const HR_PASSWORD = process.env.NEXT_PUBLIC_HR_PASSWORD || ""

type HrAccessGateProps = {
  isAuthenticated: boolean
  onAuthenticate: () => void
  onLogout: () => void
}

export function HrAccessGate({ isAuthenticated, onAuthenticate, onLogout }: HrAccessGateProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  function submit() {
    if (HR_PASSWORD !== "" && password === HR_PASSWORD) {
      onAuthenticate()
      setOpen(false)
      setPassword("")
      setError(false)
    } else {
      setError(true)
    }
  }

  if (isAuthenticated) {
    return (
      <Button size="sm" variant="outline" onClick={onLogout} className="gap-1.5">
        <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
        HR Mode · Log out
      </Button>
    )
  }

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)} className="gap-1.5 text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        HR / Admin Access
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">HR / Admin Access</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the admin password to manage the knowledge base.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Password"
              autoFocus
              className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            {error && <p className="mt-1.5 text-xs text-destructive">كلمة السر غير صحيحة</p>}
            <Button size="sm" className="mt-3 w-full" onClick={submit}>
              Unlock
            </Button>
          </div>
        </div>
      )}
    </>
  )
}