"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { useTranslation } from "@/components/voting/useTranslation"
import { Check, Copy, Printer, FileCheck, ShieldCheck } from "lucide-react"

/**
 * Vote Submitted Screen.
 * Displays success message and cryptographic receipt.
 * Auto-resets the kiosk after a countdown.
 */
export function VoteSubmittedScreen() {
  const { reset } = useVotingContext()
  const { t } = useTranslation()
  const [receiptHash] = useState("SHA256:a7f2c8e9d1b3f4a6c2e9b1d3f5a7c9e")
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  // Auto-reset timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          reset()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [reset])

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  function CurrentTime() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(new Date())
      }, 1000)

      return () => clearInterval(interval)
    }, [])

    return (
      <p className="font-mono text-xl font-black tracking-widest text-slate-900">
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
    )
  }

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
              {t("kiosk_platform")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <CurrentTime />
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-2xl space-y-8">

          {/* SUCCESS BANNER */}
          <div className="border-4 border-emerald-600 bg-emerald-50 p-8 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check className="h-14 w-14 stroke-[4]" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tight text-emerald-900">
              {t("vote_recorded")}
            </h2>
            <p className="mt-2 font-bold uppercase tracking-widest text-emerald-700/80">
              {t("submission_successful")}
            </p>
          </div>

          {/* RECEIPT SECTION */}
          <div className="bg-white p-8 shadow-xl border-4 border-slate-200">
            <div className="mb-6 flex items-center justify-between border-b-4 border-slate-100 pb-4">
              <h3 className="flex items-center gap-2 text-xl font-black uppercase text-slate-900">
                <FileCheck className="h-6 w-6 text-primary" />
                {t("digital_receipt")}
              </h3>
              <span className="bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-400">
                {t("do_not_share")}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">
                  {t("cryptographic_hash")}
                </label>
                <div className="break-all border-2 border-slate-200 bg-slate-50 p-4 font-mono text-sm font-bold text-slate-700">
                  {receiptHash}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCopyReceipt}
                  variant="outline"
                  className="h-14 flex-1 rounded-none border-4 border-slate-200 text-sm font-bold uppercase hover:bg-slate-50 hover:text-primary"
                >
                  {copied ? (
                    <span className="flex items-center gap-2 text-emerald-600">
                      <Check className="h-4 w-4" /> {t("copied")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Copy className="h-4 w-4" /> {t("copy_hash")}
                    </span>
                  )}
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="h-14 flex-1 rounded-none border-4 border-slate-200 text-sm font-bold uppercase hover:bg-slate-50 hover:text-primary"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {t("print_receipt")}
                </Button>
              </div>
            </div>
          </div>

          {/* SECURITY INFO */}
          <div className="flex items-start gap-4 border-l-4 border-slate-300 pl-4">
            <ShieldCheck className="h-8 w-8 shrink-0 text-slate-400" />
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-bold uppercase text-slate-900">
                {t("privacy_assurance")}
              </p>
              <p>
                {t("privacy_assurance_desc")}
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* --- FOOTER / AUTO RESET --- */}
      <footer className="shrink-0 border-t-4 border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase text-slate-400">
              {t("auto_reset_timer")}
            </p>
            <p className="text-lg font-black uppercase text-slate-900">
              {t("returning_to_home")} {timeLeft}s
            </p>
          </div>
          <Button
            onClick={reset}
            className="h-16 w-64 rounded-none bg-slate-900 text-lg font-black uppercase tracking-widest text-white hover:bg-primary"
          >
            {t("finish_and_logout")}
          </Button>
        </div>
      </footer>

      <p className="sr-only">
        Vote submitted successfully. Receipt hash displayed. Kiosk will reset in {timeLeft} seconds.
      </p>
    </div>
  )
}