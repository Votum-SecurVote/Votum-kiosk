"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { Check } from "lucide-react"

export function AuthSuccessScreen() {
  const { setScreen } = useVotingContext()

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("ballot")
    }, 3000)
    return () => clearTimeout(timer)
  }, [setScreen])

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

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans overflow-hidden">

      {/* HEADER — SAME AS OTHER SCREENS */}
      <header className="flex items-center justify-between border-b-4 border-primary px-10 py-6">
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
          <CurrentTime />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 items-center justify-center px-6">
        <section className="w-full max-w-2xl text-center">

          {/* CHECK ICON */}
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center border-4 border-primary">
            <Check className="h-20 w-20 text-primary stroke-[3]" />
          </div>

          {/* TITLE */}
          <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-primary">
            Identity Verified
          </h2>

          {/* DESCRIPTION */}
          <p className="mb-10 text-lg font-medium text-slate-600">
            Your identity has been successfully verified.
            <br />
            You are authorized to proceed with voting.
          </p>

          {/* AUTO REDIRECT INFO */}
          <div className="mb-8 border-2 border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold uppercase text-slate-600">
            Redirecting to ballot in 3 seconds…
          </div>

          {/* MANUAL BUTTON */}
          <Button
            onClick={() => setScreen("ballot")}
            className="h-20 w-full rounded-none bg-slate-900 text-xl font-black uppercase tracking-widest text-white hover:bg-slate-800">
            Proceed to Ballot
          </Button>


        </section>
      </main>

      <p className="sr-only">
        Identity verification successful. Proceeding to ballot selection.
      </p>
    </div>
  )
}
