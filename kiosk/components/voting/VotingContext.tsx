"use client"

import React, { createContext, useContext, useState } from "react"

/**
 * Candidate Interface.
 * Represents a candidate in the election.
 */
interface Candidate {
  id: string
  name: string
  party: string
  symbol: string
  image: string
}

/**
 * Application Screens.
 * Defines the possible states of the kiosk application flow.
 */
type Screen =
  | "welcome"
  | "identity"
  | "success"
  | "ballot"
  | "confirmation"
  | "submitted"

/**
 * Voting Context Interface.
 * Defines state and methods available throughout the voting flow.
 */
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

/**
 * Voting Context Provider.
 * Manages global state including current screen, verification status, and selected vote.
 */
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

/**
 * Custom Hook: useVotingContext
 * Accesses the voting context state.
 * Throws error if used outside VotingProvider.
 */
export function useVotingContext() {
  const context = useContext(VotingContext)
  if (context === undefined) {
    throw new Error("useVotingContext must be used within VotingProvider")
  }
  return context
}
