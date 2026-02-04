"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"

interface Candidate {
  id: string
  name: string
  party: string
  symbol: string
  image: string
}

const CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    party: "Progressive Alliance",
    symbol: "🌾",
    image: "/avatar1.png",
  },
  {
    id: "2",
    name: "Priya Singh",
    party: "Development Party",
    symbol: "🏢",
    image: "/avatar2.png",
  },
  {
    id: "3",
    name: "Vikram Patel",
    party: "National Front",
    symbol: "⚡",
    image: "/avatar3.png",
  },
  {
    id: "4",
    name: "Anjali Sharma",
    party: "Citizens Coalition",
    symbol: "🌟",
    image: "/avatar4.png",
  },
]

export function BallotScreen() {
  const { setScreen, selectedCandidate, setSelectedCandidate } =
    useVotingContext()
  const [error, setError] = useState("")

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setError("")
  }

  const handleConfirm = () => {
    if (!selectedCandidate) {
      setError("Please select a candidate to continue")
      return
    }
    setScreen("confirmation")
  }

  return (
    <div className="kiosk-locked flex h-screen flex-col bg-background px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          National Elections 2026
        </h1>
        <p className="text-lg text-muted-foreground">
          Select your preferred candidate
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-8 rounded-lg bg-primary/5 p-4 text-center text-base text-foreground">
        Tap on a candidate card to select them, then confirm your choice
      </div>

      {/* Candidates Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {CANDIDATES.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => handleSelectCandidate(candidate)}
              className={`touch-button group relative flex flex-col gap-4 rounded-xl border-4 p-6 transition-all duration-300 ${
                selectedCandidate?.id === candidate.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
              }`}
              aria-pressed={selectedCandidate?.id === candidate.id}
              aria-label={`Select ${candidate.name} from ${candidate.party}`}
            >
              {/* Selection indicator */}
              <div className="absolute right-4 top-4">
                <div
                  className={`h-8 w-8 rounded-full border-3 flex items-center justify-center transition-all ${
                    selectedCandidate?.id === candidate.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selectedCandidate?.id === candidate.id && (
                    <span className="text-xl text-white">✓</span>
                  )}
                </div>
              </div>

              {/* Party Symbol */}
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-5xl">
                {candidate.symbol}
              </div>

              {/* Candidate Info */}
              <div className="flex-1 text-left">
                <h3 className="mb-1 text-2xl font-bold text-primary">
                  {candidate.name}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {candidate.party}
                </p>
              </div>

              {/* Selection state indicator */}
              {selectedCandidate?.id === candidate.id && (
                <div className="rounded-lg bg-accent/10 py-2 text-center text-base font-semibold text-accent">
                  ✓ Selected
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="my-6 rounded-lg bg-destructive/10 p-4 text-center text-base font-semibold text-destructive">
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Button
          onClick={() => setScreen("welcome")}
          variant="outline"
          className="touch-button flex-1 h-14 text-base font-semibold"
        >
          Exit
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedCandidate}
          className="touch-button flex-1 h-14 bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          Confirm Selection
        </Button>
      </div>

      <p className="sr-only">
        Ballot screen. {CANDIDATES.length} candidates available. Select a
        candidate and confirm your choice.
      </p>
    </div>
  )
}
