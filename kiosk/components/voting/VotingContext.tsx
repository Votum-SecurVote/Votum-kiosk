"use client"

import React, { createContext, useContext, useState } from "react"

interface Candidate {
  id: string
  name: string
  party: string
  symbol: string
  image: string
}

type Screen =
  | "welcome"
  | "identity"
  | "success"
  | "ballot"
  | "confirmation"
  | "submitted"

interface VotingContextType {
  screen: Screen
  setScreen: (screen: Screen) => void
  verified: boolean
  setVerified: (verified: boolean) => void
  selectedCandidate: Candidate | null
  setSelectedCandidate: (candidate: Candidate | null) => void
  language: string
  setLanguage: (lang: string) => void
  reset: () => void
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)

export function VotingProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("welcome")
  const [verified, setVerified] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  )
  const [language, setLanguage] = useState("en")

  const reset = () => {
    setScreen("welcome")
    setVerified(false)
    setSelectedCandidate(null)
  }

  return (
    <VotingContext.Provider
      value={{
        screen,
        setScreen,
        verified,
        setVerified,
        selectedCandidate,
        setSelectedCandidate,
        language,
        setLanguage,
        reset,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export function useVotingContext() {
  const context = useContext(VotingContext)
  if (context === undefined) {
    throw new Error("useVotingContext must be used within VotingProvider")
  }
  return context
}
