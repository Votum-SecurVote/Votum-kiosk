"use client"

import { useEffect } from "react"
import { VotingProvider, useVotingContext } from "@/components/voting/VotingContext"
import { WelcomeScreen } from "@/components/voting/WelcomeScreen"
import { IdentityVerificationScreen } from "@/components/voting/IdentityVerificationScreen"
import { AuthSuccessScreen } from "@/components/voting/AuthSuccessScreen"
import { BallotScreen } from "@/components/voting/BallotScreen"
import { ConfirmationScreen } from "@/components/voting/ConfirmationScreen"
import { VoteSubmittedScreen } from "@/components/voting/VoteSubmittedScreen"

function VotingAppContent() {
  const {
    screen,
    setLanguage,
  } = useVotingContext()

  // Prevent right-click and keyboard shortcuts for kiosk security
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Alt+F4
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.altKey && e.key === "F4")
      ) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    // Hide URL bar if possible
    window.scrollTo(0, 1)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="min-h-screen transition-all duration-300">
      {/* Screen Router */}
      {screen === "welcome" && (
        <WelcomeScreen
          onLanguageSelect={setLanguage}
        />
      )}
      {screen === "identity" && <IdentityVerificationScreen />}
      {screen === "success" && <AuthSuccessScreen />}
      {screen === "ballot" && <BallotScreen />}
      {screen === "confirmation" && <ConfirmationScreen />}
      {screen === "submitted" && <VoteSubmittedScreen />}

      {/* Hidden URL bar */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </div>
  )
}

export function VotingApp() {
  return (
    <VotingProvider>
      <VotingAppContent />
    </VotingProvider>
  )
}
