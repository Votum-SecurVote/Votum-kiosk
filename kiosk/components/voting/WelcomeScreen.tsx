'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { ChevronRight, Languages, ShieldCheck, UserCheck, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeScreenProps {
  onLanguageSelect: (lang: string) => void
}

import { useTranslation, LANGUAGES } from "@/components/voting/useTranslation"

function CurrentTime() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <p suppressHydrationWarning className="font-mono text-xl font-black tracking-widest text-slate-900">
      {time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </p>
  )
}

/**
 * Welcome Screen Component.
 * First screen of the kiosk.
 * Handles language selection and initiation of the voting process.
 */
export function WelcomeScreen({ onLanguageSelect }: WelcomeScreenProps) {
  const { setScreen } = useVotingContext()
  const { t } = useTranslation()
  const [selectedLang, setSelectedLang] = useState('en')

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans">

      {/* HEADER */}
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
              {t("kiosk_platform")}
            </p>
          </div>
        </div>

        <div className="text-right">
          <CurrentTime />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left */}
        <section className="flex flex-[1.2] flex-col justify-center border-r border-slate-100 px-12 lg:px-20">
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Languages className="h-6 w-6" />
              <span>{t("step_1_choose_language")}</span>
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
            className="group relative h-28 w-full rounded-none bg-slate-900 text-3xl font-black uppercase tracking-widest text-white hover:bg-slate-800"
          >
            {t("begin_voting")}
            <ChevronRight className="ml-4 h-10 w-10 transition-transform group-hover:translate-x-2" />
            <div className="absolute -bottom-2 -right-2 -z-10 h-full w-full bg-primary/20" />
          </Button>
        </section>

        {/* Right */}
        <section className="hidden flex-1 flex-col justify-center bg-slate-50 px-12 lg:flex">
          <h2 className="mb-8 text-xl font-black uppercase tracking-tight text-slate-400">
            {t("prep_checklist")}
          </h2>

          <div className="space-y-10">
            <ChecklistBox
              icon={<ShieldCheck className="h-8 w-8 text-primary" />}
              title={t("identity_ready_title")}
              description={t("identity_ready_desc")}
            />
            <ChecklistBox
              icon={<UserCheck className="h-8 w-8 text-primary" />}
              title={t("clear_face_title")}
              description={t("clear_face_desc")}
            />
            <ChecklistBox
              icon={<Eye className="h-8 w-8 text-primary" />}
              title={t("privacy_guard_title")}
              description={t("privacy_guard_desc")}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function ChecklistBox({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-6">
      <div className="flex h-16 w-16 items-center justify-center bg-white border border-slate-200">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black uppercase text-slate-800 mb-1">
          {title}
        </h3>
        <p className="text-slate-500 font-medium max-w-[280px]">
          {description}
        </p>
      </div>
    </div>
  )
}
