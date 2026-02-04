'use client';

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { ChevronRight, Languages, ShieldCheck, UserCheck, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeScreenProps {
  onLanguageSelect: (lang: string) => void
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
]

export function WelcomeScreen({ onLanguageSelect }: WelcomeScreenProps) {
  const { setScreen } = useVotingContext()
  const [selectedLang, setSelectedLang] = useState('en')

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans">

      {/* 1. Header Area: Branding & Authority */}
      <header className="flex items-center justify-between border-b-4 border-primary px-10 py-8">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center bg-primary text-white">
            <span className="text-3xl">🏛️</span>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              <span className="text-primary">VOTUM</span>
            </h1>
            <p className="text-sm font-bold text-slate-400">Kiosk Voting Platform</p>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-400">Session Security</p>
            <p className="font-mono text-sm font-bold">AES-256 ENCRYPTED</p>
          </div>
        </div>
      </header>

      {/* 2. Main Content: Split Layout */}
      <main className="flex flex-1 overflow-hidden">

        {/* Left Side: Language & Primary Action */}
        <section className="flex flex-[1.2] flex-col justify-center border-r border-slate-100 px-12 lg:px-20">
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Languages className="h-6 w-6" />
              <span>STEP 1: CHOOSE LANGUAGE</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code)
                    onLanguageSelect(lang.code)
                  }}
                  className={cn(
                    "flex h-20 items-center justify-center rounded-none border-4 text-2xl font-black transition-all",
                    selectedLang === lang.code
                      ? "border-primary bg-primary text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
                      : "border-slate-200 hover:border-slate-400 text-slate-600"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setScreen("identity")}
            className="group relative h-28 w-full rounded-none bg-slate-900 text-3xl font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800"
          >
            Begin Voting
            <ChevronRight className="ml-4 h-10 w-10 transition-transform group-hover:translate-x-2" />
            <div className="absolute -bottom-2 -right-2 -z-10 h-full w-full bg-primary/20" />
          </Button>
        </section>

        {/* Right Side: Visual Requirements */}
        <section className="hidden flex-1 flex-col justify-center bg-slate-50 px-12 lg:flex">
          <h2 className="mb-8 text-xl font-black uppercase tracking-tight text-slate-400">
            Preparation Checklist
          </h2>

          <div className="space-y-10">
            <ChecklistBox
              icon={<ShieldCheck className="h-8 w-8 text-primary" />}
              title="Identity Ready"
              description="Have your physical Aadhaar card or Digital ID ready for scanning."
            />
            <ChecklistBox
              icon={<UserCheck className="h-8 w-8 text-primary" />}
              title="Clear Face"
              description="Remove hats, masks, or heavy glasses for biometric facial match."
            />
            <ChecklistBox
              icon={<Eye className="h-8 w-8 text-primary" />}
              title="Privacy Guard"
              description="Ensure no one else is looking at the screen while you vote."
            />
          </div>

          <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="flex items-center gap-4 text-slate-400">
              <div className="h-12 w-12 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold">?</div>
              <p className="text-sm font-medium">
                Need assistance? Press the <span className="font-bold text-slate-900">RED HELP BUTTON</span> on the physical kiosk console.
              </p>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}

function ChecklistBox({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-white shadow-sm border border-slate-200">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black uppercase leading-none text-slate-800 mb-1">{title}</h3>
        <p className="text-slate-500 font-medium leading-tight max-w-[280px]">{description}</p>
      </div>
    </div>
  )
}