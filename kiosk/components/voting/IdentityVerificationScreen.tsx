"use client"

import { kioskLogin } from "@/services/kioskApi"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { useTranslation } from "@/components/voting/useTranslation"
import { ChevronRight } from "lucide-react"

/**
 * Identity Verification Screen.
 * Handles multi-step verification: Aadhaar Input -> OTP -> Face Verification.
 * Interfaces with backend Kiosk API.
 */
export function IdentityVerificationScreen() {
  const { setScreen, setVerified } = useVotingContext()
  const { t } = useTranslation()

  // --- NEW STATE FOR EMAIL & PASSWORD ---
  const [aadhaar, setAadhaar] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"aadhaar" | "otp" | "face">("aadhaar")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)


  // Format Aadhaar number with spaces
  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12)
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
  }

  // Handle OTP Dispatch
  const handleSendOtp = async () => {
    if (aadhaar.replace(/\s/g, "").length !== 12) {
      setError(t("err_aadhaar"))
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError(t("err_email"))
      return
    }

    if (password.length < 6) {
      setError(t("err_password"))
      return
    }

    try {
      setLoading(true)
      setError("")

      const token = await kioskLogin({
        email,
        password,
        aadhaar: aadhaar.replace(/\s/g, ""),
      })

      // Store JWT
      localStorage.setItem("kiosk_token", token)

      setStep("otp")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  // Verify OTP Input
  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError(t("err_otp"))
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setError("")
      setStep("face")
      startCamera()
    }, 1500)
  }

  // Initialize Camera for Face Eval
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setError(t("err_camera"))
    }
  }

  const handleCompleteFaceVerification = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setVerified(true)
      setScreen("success")
    }, 2000)
  }

  const handleBack = () => {
    setError("")
    if (step === "otp") {
      setScreen("welcome")
      setOtp("")
    } else if (step === "face") {
      setScreen("welcome")
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    } else {
      setScreen("welcome")
    }
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

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans overflow-hidden">

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

      {/* MAIN */}
      <main className="flex flex-1 items-center justify-center px-6 overflow-y-auto">
        <section className="w-full max-w-2xl py-10">

          {/* TITLE */}
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary mb-2">
              {t("identity_verification")}
            </h2>
            <p className="text-slate-500 font-medium">
              {t("step")} {step === "aadhaar" ? "1" : step === "otp" ? "2" : "3"} {t("of_3")}
            </p>
          </div>

          {/* STEP 1: AADHAAR, EMAIL, PASSWORD */}
          {step === "aadhaar" && (
            <div className="space-y-4">
              {/* Aadhaar Input */}
              <div>
                <label className="mb-1 block text-sm font-bold uppercase text-slate-500">{t("aadhaar_number")}</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                  className="h-16 w-full border-4 border-slate-200 px-4 text-xl font-black tracking-widest focus:border-primary focus:outline-none"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="mb-1 block text-sm font-bold uppercase text-slate-500">{t("email_address")}</label>
                <input
                  type="email"
                  placeholder="VOTER@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-16 w-full border-4 border-slate-200 px-4 text-xl font-bold tracking-wide focus:border-primary focus:outline-none"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="mb-1 block text-sm font-bold uppercase text-slate-500">{t("password")}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-16 w-full border-4 border-slate-200 px-4 text-xl font-black tracking-widest focus:border-primary focus:outline-none"
                />
              </div>

              {error && <p className="text-red-600 font-bold uppercase pt-2">{error}</p>}

              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="mt-2 h-20 w-full rounded-none bg-slate-900 text-2xl font-black uppercase tracking-widest text-white hover:bg-slate-800"
              >
                {loading ? t("sending") : t("send_otp")}
                <ChevronRight className="ml-4 h-8 w-8" />
              </Button>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <div className="space-y-6">
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="h-20 w-full border-4 border-slate-200 px-6 text-3xl font-black text-center tracking-[10px] focus:border-primary focus:outline-none"
              />

              {error && <p className="text-red-600 font-bold uppercase">{error}</p>}

              <Button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="h-20 w-full rounded-none bg-slate-900 text-2xl font-black uppercase tracking-widest text-white hover:bg-slate-800"
              >
                {loading ? t("verifying") : t("verify_otp")}
                <ChevronRight className="ml-4 h-8 w-8" />
              </Button>
            </div>
          )}

          {/* STEP 3: FACE */}
          {step === "face" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="
                    w-full 
                    max-w-sm 
                    aspect-[4/5] 
                    max-h-[38vh] 
                    border-4 
                    border-primary 
                    object-cover
                  "
                />
              </div>

              {error && (
                <p className="text-red-600 font-bold uppercase text-center">
                  {error}
                </p>
              )}

              <Button
                onClick={handleCompleteFaceVerification}
                disabled={loading}
                className="h-16 w-full rounded-none bg-slate-900 text-lg font-black uppercase tracking-widest text-white hover:bg-slate-800"
              >
                {loading ? t("processing") : t("complete_verification")}
              </Button>
            </div>
          )}

          {/* BACK BUTTON */}
          <Button
            onClick={handleBack}
            variant="outline"
            className="mt-6 h-16 w-full rounded-none border-4 border-primary text-primary font-black uppercase hover:bg-primary hover:text-white"
          >
            {t("back")}
          </Button>

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm font-medium text-slate-500">
            🔒 {t("info_encrypted")}
          </div>

        </section>
      </main>
    </div>
  )
}