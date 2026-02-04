'use client';

import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"

interface WelcomeScreenProps {
  onLanguageSelect: (lang: string) => void
  onAccessibilityToggle: (enabled: boolean) => void
  isHighContrast: boolean
}

export function WelcomeScreen({
  onLanguageSelect,
  onAccessibilityToggle,
  isHighContrast,
}: WelcomeScreenProps) {
  const { setScreen } = useVotingContext()

  return (
    <div className="kiosk-locked flex h-screen flex-col items-center justify-center bg-background px-8 py-12 animate-fade-in">
      {/* Government Logo Area */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary">
        <span className="text-4xl font-bold text-white">🏛️</span>
      </div>

      {/* Election Title */}
      <h1 className="mb-2 text-center text-4xl font-bold text-primary md:text-5xl">
        National Elections 2026
      </h1>
      <p className="mb-12 text-center text-lg text-muted-foreground md:text-xl">
        Secure Digital Voting Platform
      </p>

      {/* Accessibility Controls */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
        <Button
          onClick={() => onAccessibilityToggle(!isHighContrast)}
          variant="outline"
          className="touch-button h-12 px-6 text-base"
          aria-label={
            isHighContrast
              ? "Disable high contrast mode"
              : "Enable high contrast mode"
          }
        >
          {isHighContrast ? "🔆 High Contrast: ON" : "☀️ High Contrast: OFF"}
        </Button>

        <select
          onChange={(e) => onLanguageSelect(e.target.value)}
          className="touch-button h-12 rounded-lg border-2 border-primary bg-secondary px-4 text-base font-medium text-primary"
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
        </select>
      </div>

      {/* Main CTA */}
      <Button
        onClick={() => setScreen("identity")}
        className="touch-button mb-8 h-16 w-full max-w-sm bg-primary px-8 text-xl font-bold text-white hover:bg-primary/90 md:max-w-md"
        aria-label="Start voting process"
      >
        Start Voting
      </Button>

      {/* Instructions */}
      <div className="mt-8 max-w-2xl rounded-lg bg-muted/30 p-6 text-center text-sm leading-relaxed text-foreground md:text-base">
        <p className="font-semibold mb-3">Important Information:</p>
        <ul className="space-y-2 text-left">
          <li>✓ Your vote is completely secure and private</li>
          <li>✓ You will need your Aadhaar number for verification</li>
          <li>✓ Your face will be verified for identity confirmation</li>
          <li>✓ Once you submit your vote, it cannot be changed</li>
        </ul>
      </div>

      {/* Accessibility Info */}
      <p className="sr-only">
        Welcome to the secure digital voting platform. Press the Start Voting button to begin the verification process.
      </p>
    </div>
  )
}
