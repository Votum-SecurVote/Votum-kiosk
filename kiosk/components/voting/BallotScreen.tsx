"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { Check, AlertCircle } from "lucide-react"

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
  const { setScreen, selectedCandidate, setSelectedCandidate } = useVotingContext()
  const [error, setError] = useState("")

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setError("")
  }

  const handleConfirm = () => {
    if (!selectedCandidate) {
      setError("You must select a candidate to proceed.")
      return
    }
    setScreen("confirmation")
  }

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans overflow-hidden">

      {/* --- HEADER (MATCHING PREVIOUS SCREEN) --- */}
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

      {/* --- MAIN SCROLLABLE CONTENT --- */}
      <main className="flex flex-1 flex-col overflow-hidden">

        {/* SUB-HEADER / INSTRUCTIONS */}
        <div className="shrink-0 bg-slate-50 px-8 py-6 border-b-2 border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
                Official Ballot
              </h2>
              <p className="font-medium text-slate-500">
                National Elections 2026
              </p>
            </div>
            <div className="max-w-md text-right hidden md:block">
              <p className="text-sm font-bold uppercase text-primary">Instructions</p>
              <p className="text-sm text-slate-600">
                Tap a candidate card below to select your choice.
                Press "Confirm Vote" at the bottom when ready.
              </p>
            </div>
          </div>
        </div>

        {/* CANDIDATES GRID (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50">
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {CANDIDATES.map((candidate) => {
              const isSelected = selectedCandidate?.id === candidate.id

              return (
                <button
                  key={candidate.id}
                  onClick={() => handleSelectCandidate(candidate)}
                  className={`group relative flex items-center gap-6 border-4 p-6 text-left transition-all duration-200 ease-in-out
                    ${isSelected
                      ? "border-primary bg-white shadow-xl ring-2 ring-primary/20 scale-[1.01]"
                      : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-md"
                    }
                  `}
                  aria-pressed={isSelected}
                  aria-label={`Vote for ${candidate.name}`}
                >
                  {/* CHECKMARK INDICATOR (TOP RIGHT) */}
                  <div className={`absolute right-0 top-0 flex h-10 w-10 items-center justify-center border-b-4 border-l-4 transition-colors
                    ${isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-slate-100 bg-slate-100 text-slate-300"
                    }`}>
                    <Check className="h-6 w-6 stroke-[4]" />
                  </div>

                  {/* SYMBOL BOX */}
                  <div className={`flex h-24 w-24 shrink-0 items-center justify-center border-2 text-5xl
                     ${isSelected ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50"}
                  `}>
                    {candidate.symbol}
                  </div>

                  {/* INFO */}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {candidate.party}
                    </span>
                    <span className="text-2xl font-black uppercase leading-tight text-slate-900 group-hover:text-primary transition-colors">
                      {candidate.name}
                    </span>
                    {isSelected && (
                      <span className="mt-2 inline-block w-fit bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* --- FOOTER / ACTIONS --- */}
      <footer className="shrink-0 border-t-4 border-slate-200 bg-white px-8 py-6">

        {/* ERROR MESSAGE AREA */}
        {error && (
          <div className="mb-4 flex items-center gap-3 border-l-4 border-red-600 bg-red-50 p-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="font-bold text-red-900 uppercase tracking-tight">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => setScreen("welcome")}
            variant="ghost"
            className="h-20 flex-1 rounded-none border-4 border-slate-200 bg-transparent text-xl font-bold uppercase text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            className={`h-20 flex-[3] rounded-none text-xl font-black uppercase tracking-widest transition-all
              ${selectedCandidate
                ? "bg-slate-900 text-white hover:bg-primary"
                : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200"
              }
            `}
          >
            {selectedCandidate ? "Confirm Vote" : "Select a Candidate"}
          </Button>
        </div>
      </footer>

      <p className="sr-only">
        Ballot screen. {CANDIDATES.length} candidates available. Select a candidate and confirm.
      </p>
    </div>
  )
}