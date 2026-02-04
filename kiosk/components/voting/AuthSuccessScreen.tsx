"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"

export function AuthSuccessScreen() {
  const { setScreen } = useVotingContext()

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("ballot")
    }, 3000)
    return () => clearTimeout(timer)
  }, [setScreen])

  return (
    <div className="kiosk-locked flex h-screen flex-col items-center justify-center bg-gradient-to-b from-accent/5 to-background px-6 py-8 animate-fade-in">
      <div className="flex flex-col items-center gap-8">
        {/* Check Mark Animation */}
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-accent">
          <svg
            className="h-24 w-24 animate-check"
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

        {/* Success Message */}
        <h1 className="animate-slide-up text-center text-4xl font-bold text-accent md:text-5xl">
          Identity Verified
        </h1>

        <p className="max-w-2xl animate-slide-up text-center text-lg text-muted-foreground md:text-xl">
          Your identity has been successfully verified. You are now ready to proceed with your vote.
        </p>

        {/* Auto-proceed message */}
        <div className="rounded-lg bg-accent/10 p-6 text-center text-base font-medium text-accent-foreground">
          Redirecting to ballot in 3 seconds...
        </div>

        {/* Manual proceed button */}
        <Button
          onClick={() => setScreen("ballot")}
          className="touch-button h-14 bg-primary px-8 text-lg font-semibold text-white hover:bg-primary/90 md:px-12"
        >
          Proceed to Ballot
        </Button>
      </div>

      <p className="sr-only">
        Identity verification successful. Proceeding to ballot selection.
      </p>
    </div>
  )
}
