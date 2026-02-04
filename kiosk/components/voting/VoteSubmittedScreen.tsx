"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"

export function VoteSubmittedScreen() {
  const { reset } = useVotingContext()
  const [receiptHash] = useState(
    "SHA256: a7f2c8e9d1b3f4a6c2e9b1d3f5a7c9e"
  )
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      reset()
    }, 30000) // Auto-logout after 30 seconds

    return () => clearTimeout(timer)
  }, [reset])

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleFinish = () => {
    reset()
  }

  return (
    <div className="kiosk-locked flex h-screen flex-col items-center justify-center bg-gradient-to-b from-accent/10 to-background px-6 py-8 animate-fade-in">
      <div className="w-full max-w-2xl">
        {/* Success Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-accent">
            <svg
              className="h-32 w-32 animate-check"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 60,
                  strokeDashoffset: 0,
                }}
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="mb-4 text-center text-4xl font-bold text-accent md:text-5xl">
          Vote Submitted Successfully
        </h1>

        <p className="mb-8 text-center text-lg text-muted-foreground md:text-xl">
          Your vote has been securely recorded and encrypted.
        </p>

        {/* Receipt Section */}
        <div className="space-y-6 rounded-xl border-2 border-accent bg-accent/5 p-8">
          <div>
            <h2 className="mb-4 text-xl font-bold text-primary">
              Receipt Hash
            </h2>
            <div className="break-all rounded-lg border border-border bg-background p-4 font-mono text-sm text-foreground">
              {receiptHash}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCopyReceipt}
              className="touch-button flex-1 h-12 bg-primary text-white hover:bg-primary/90"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </Button>
            <Button
              onClick={handlePrint}
              className="touch-button flex-1 h-12 bg-primary text-white hover:bg-primary/90"
            >
              🖨️ Print
            </Button>
          </div>
        </div>

        {/* Information */}
        <div className="mt-8 space-y-4 rounded-lg bg-primary/5 p-6">
          <h3 className="font-bold text-primary">Important Information:</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>✓ Your vote is anonymized and cannot be traced back to you</li>
            <li>✓ The receipt hash can be used to verify vote integrity</li>
            <li>✓ Results will be published after all voting is complete</li>
            <li>✓ Your data will be securely deleted after the election</li>
          </ul>
        </div>

        {/* Auto-logout countdown */}
        <div className="mt-8 rounded-lg bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          This kiosk will return to the welcome screen in 30 seconds...
        </div>

        {/* Finish Button */}
        <Button
          onClick={handleFinish}
          className="touch-button mt-8 w-full h-14 bg-accent text-base font-semibold text-white hover:bg-accent/90"
        >
          Finish & Reset
        </Button>
      </div>

      <p className="sr-only">
        Vote submitted successfully. Receipt hash displayed for verification. Kiosk will
        auto-reset in 30 seconds.
      </p>
    </div>
  )
}
