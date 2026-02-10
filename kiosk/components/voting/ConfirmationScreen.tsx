"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { AlertTriangle, Lock, ArrowLeft, CheckCircle2, Vote } from "lucide-react"

export function ConfirmationScreen() {
  const { selectedCandidate, setScreen } = useVotingContext()
  const [reAuthPassword, setReAuthPassword] = useState("")
  const [step, setStep] = useState<"confirm" | "auth">("confirm")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleProceedToAuth = () => {
    setStep("auth")
    setError("")
  }

  const handleVerifyPassword = () => {
    if (!reAuthPassword) {
      setError("PASSWORD REQUIRED")
      return
    }
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setScreen("submitted")
    }, 1500)
  }

  const handleBack = () => {
    if (step === "auth") {
      setStep("confirm")
      setReAuthPassword("")
      setError("")
    } else {
      setScreen("ballot")
    }
  }

  if (!selectedCandidate) return null

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans overflow-hidden">

      {/* --- HEADER --- */}
      <header className="flex shrink-0 items-center justify-between border-b-4 border-primary px-8 py-5">
        <div className="flex items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center bg-primary text-white">
            <span className="text-2xl">🏛️</span>
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight italic">
              <span className="text-primary">VOTUM</span>
            </h1>
            <p className="text-xs font-bold text-slate-400">
              Kiosk Voting Platform
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-slate-400">
            Session Security
          </p>
          <p className="font-mono text-xs font-bold">
            AES-256 ENCRYPTED
          </p>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-2xl bg-white p-8 shadow-xl border-4 border-slate-200">

          {/* STEP 1: REVIEW SELECTION */}
          {step === "confirm" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                  Confirm Selection
                </h2>
                <p className="font-bold text-slate-400 uppercase tracking-widest text-sm mt-2">
                  Step 1 of 2
                </p>
              </div>

              {/* CANDIDATE TICKET */}
              <div className="relative border-4 border-slate-900 bg-slate-900 p-1">
                <div className="flex flex-col items-center bg-white p-8 text-center border-2 border-white border-dashed">

                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-6xl border-4 border-primary/20">
                    {selectedCandidate.symbol}
                  </div>

                  <h3 className="text-4xl font-black uppercase tracking-tight text-slate-900">
                    {selectedCandidate.name}
                  </h3>

                  <div className="mt-2 inline-block bg-slate-100 px-3 py-1 text-sm font-bold uppercase tracking-wider text-slate-500">
                    {selectedCandidate.party}
                  </div>
                </div>
              </div>

              {/* WARNING BOX */}
              <div className="flex gap-4 border-l-8 border-amber-400 bg-amber-50 p-5">
                <AlertTriangle className="h-8 w-8 shrink-0 text-amber-600" />
                <div>
                  <h4 className="font-black uppercase text-amber-700">Irreversible Action</h4>
                  <p className="text-sm font-medium text-amber-800/80 leading-relaxed">
                    Once you proceed to the next step, your choice is locked.
                    Please verify that this is the candidate you intend to support.
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="h-16 rounded-none border-4 border-slate-200 text-lg font-bold uppercase text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Return
                </Button>
                <Button
                  onClick={handleProceedToAuth}
                  className="h-16 rounded-none bg-primary text-lg font-black uppercase tracking-wider text-white hover:bg-primary/90"
                >
                  Confirm & Verify
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: AUTHENTICATION */}
          {step === "auth" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">

              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                  Final Verification
                </h2>
                <p className="font-bold text-slate-400 uppercase tracking-widest text-sm mt-2">
                  Step 2 of 2
                </p>
              </div>

              <div className="bg-slate-100 p-6 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-slate-200">
                  <span className="text-sm font-bold uppercase text-slate-500">Casting vote for:</span>
                  <span className="text-xl font-black uppercase text-slate-900">{selectedCandidate.name}</span>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-bold uppercase text-slate-700">
                    <Lock className="h-4 w-4" />
                    Enter Security Password
                  </label>

                  <input
                    type="password"
                    autoFocus
                    placeholder="••••••••"
                    value={reAuthPassword}
                    onChange={(e) => {
                      setReAuthPassword(e.target.value)
                      setError("")
                    }}
                    className="h-16 w-full rounded-none border-4 border-slate-300 bg-white px-4 text-center text-3xl font-black tracking-widest text-slate-900 placeholder:text-slate-200 focus:border-primary focus:outline-none"
                  />

                  {error && (
                    <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase text-red-600 animate-pulse">
                      <AlertTriangle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* FINAL ACTIONS */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleBack}
                  disabled={loading}
                  variant="outline"
                  className="h-16 rounded-none border-4 border-slate-200 text-lg font-bold uppercase text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>

                <Button
                  onClick={handleVerifyPassword}
                  disabled={loading || !reAuthPassword}
                  className={`h-16 rounded-none text-lg font-black uppercase tracking-widest text-white transition-all
                    ${loading ? "bg-slate-800" : "bg-red-600 hover:bg-red-700"}
                  `}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Vote className="h-5 w-5" />
                      Cast Final Vote
                    </span>
                  )}
                </Button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t-4 border-slate-200 bg-white py-4 text-center">
        <p className="text-[10px] font-bold uppercase text-slate-300">
          Official Ballot System v2.4 • Unauthorized access is a felony
        </p>
      </footer>
    </div>
  )
}