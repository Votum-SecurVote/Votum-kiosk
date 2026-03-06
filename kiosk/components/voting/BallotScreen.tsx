"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { useTranslation } from "@/components/voting/useTranslation"
import { Check, AlertCircle } from "lucide-react"
import { getActiveElection, getBallots, getCandidates } from "@/services/kioskApi"

// Local Interface for Candidate Display
interface Candidate {
  id: string
  name: string
  party: string
  symbol: string
  image: string
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

/**
 * Ballot Screen Component.
 * Displays the list of candidates for the active election.
 * Fetches data from the backend upon mounting.
 */
export function BallotScreen() {
  const { setScreen, selectedCandidate, setSelectedCandidate } = useVotingContext()
  const { t } = useTranslation()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch active election and associated ballot/candidates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const election = await getActiveElection()
        const ballots = await getBallots(election.id)

        if (ballots.length === 0) {
          throw new Error("No ballots found")
        }

        const ballotId = ballots[0].id
        const candidateData = await getCandidates(ballotId)

        setCandidates(candidateData)

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setError("")
  }

  const handleConfirm = () => {
    if (!selectedCandidate) {
      setError(t("err_must_select"))
      return
    }
    setScreen("confirmation")
  }

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans overflow-hidden">

      {/* HEADER */}
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

      <main className="flex flex-1 flex-col overflow-hidden">

        <div className="shrink-0 bg-slate-50 px-8 py-6 border-b-2 border-slate-200">
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
            {t("official_ballot")}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50">
          {loading ? (
            <p className="text-center font-bold">{t("loading_candidates")}</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
              {candidates.map((candidate) => {
                const isSelected = selectedCandidate?.id === candidate.id

                return (
                  <button
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(candidate)}
                    className={`group relative flex items-center gap-6 border-4 p-6 text-left
                      ${isSelected
                        ? "border-primary bg-white shadow-xl"
                        : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                  >
                    <div className="text-5xl">{candidate.symbol}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-400">
                        {candidate.party}
                      </p>
                      <p className="text-2xl font-black">
                        {candidate.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t-4 border-slate-200 bg-white px-8 py-6">

        {error && (
          <div className="mb-4 flex items-center gap-3 border-l-4 border-red-600 bg-red-50 p-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="font-bold text-red-900 uppercase">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => setScreen("welcome")}
            variant="ghost"
            className="h-20 flex-1"
          >
            {t("cancel")}
          </Button>

          <Button
            onClick={handleConfirm}
            className="h-20 flex-[3]"
          >
            {t("confirm_vote")}
          </Button>
        </div>
      </footer>
    </div>
  )
}
