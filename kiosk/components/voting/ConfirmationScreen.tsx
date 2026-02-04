"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"

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
      setError("Please enter a password to confirm")
      return
    }
    setLoading(true)
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

  if (!selectedCandidate) {
    return null
  }

  return (
    <div className="kiosk-locked flex h-screen flex-col items-center justify-center bg-background px-6 py-8 animate-fade-in">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <h1 className="mb-8 text-center text-4xl font-bold text-primary md:text-5xl">
          Confirm Your Vote
        </h1>

        {step === "confirm" && (
          <div className="space-y-6 animate-slide-up">
            {/* Selected Candidate Display */}
            <div className="rounded-xl border-4 border-primary bg-primary/5 p-8">
              <div className="text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-lg bg-primary/10 text-6xl mx-auto">
                  {selectedCandidate.symbol}
                </div>
                <h2 className="mb-2 text-3xl font-bold text-primary">
                  {selectedCandidate.name}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {selectedCandidate.party}
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-6">
              <p className="text-center text-lg font-bold text-destructive">
                ⚠️ Important Warning
              </p>
              <p className="mt-3 text-center text-base text-foreground">
                You cannot change your vote after confirmation. Please ensure
                you have selected the correct candidate before proceeding.
              </p>
            </div>

            {/* Confirmation Message */}
            <div className="rounded-lg bg-accent/10 p-6 text-center">
              <p className="text-base text-accent-foreground">
                ✓ You are about to cast your vote for{" "}
                <span className="font-bold">{selectedCandidate.name}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="touch-button flex-1 h-14 text-base font-semibold bg-transparent"
              >
                Go Back
              </Button>
              <Button
                onClick={handleProceedToAuth}
                className="touch-button flex-1 h-14 bg-primary text-base font-semibold text-white hover:bg-primary/90"
              >
                Proceed
              </Button>
            </div>
          </div>
        )}

        {step === "auth" && (
          <div className="space-y-6 animate-slide-up">
            {/* Re-authentication */}
            <div className="rounded-lg bg-primary/5 p-6 text-center">
              <p className="mb-6 text-lg text-foreground">
                Please re-authenticate to confirm your vote
              </p>

              <div>
                <label className="mb-3 block text-left text-lg font-semibold text-foreground">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={reAuthPassword}
                  onChange={(e) => {
                    setReAuthPassword(e.target.value)
                    setError("")
                  }}
                  className="touch-button w-full rounded-lg border-2 border-primary bg-input px-4 py-4 text-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Enter password for confirmation"
                />
              </div>

              {error && (
                <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-base text-destructive">
                  ⚠️ {error}
                </p>
              )}
            </div>

            {/* Final Vote Summary */}
            <div className="rounded-xl border-4 border-primary bg-primary/5 p-6 text-center">
              <p className="text-lg text-muted-foreground">
                You are voting for:
              </p>
              <h3 className="mt-2 text-2xl font-bold text-primary">
                {selectedCandidate.name}
              </h3>
            </div>

            {/* Final Warning */}
            <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4 text-center">
              <p className="font-bold text-destructive">
                Your vote cannot be changed after submission.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="touch-button flex-1 h-14 text-base font-semibold bg-transparent"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyPassword}
                disabled={loading || !reAuthPassword}
                className="touch-button flex-1 h-14 bg-destructive text-base font-semibold text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Cast Vote"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="sr-only">
        Confirmation screen. Review your selected candidate: {selectedCandidate.name}. Your vote cannot be changed
        after submission.
      </p>
    </div>
  )
}
