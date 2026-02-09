"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"
import { ChevronRight } from "lucide-react"

export function IdentityVerificationScreen() {
  const { setScreen, setVerified } = useVotingContext()

  const [aadhaar, setAadhaar] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"aadhaar" | "otp" | "face">("aadhaar")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12)
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
  }

  const handleSendOtp = () => {
    if (aadhaar.replace(/\s/g, "").length !== 12) {
      setError("ENTER VALID 12-DIGIT AADHAAR")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setError("")
      setStep("otp")
    }, 1500)
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError("ENTER VALID 6-DIGIT OTP")
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setError("CAMERA ACCESS DENIED")
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
      setStep("aadhaar")
      setOtp("")
    } else if (step === "face") {
      setStep("otp")
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    } else {
      setScreen("welcome")
    }
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

      {/* MAIN */}
      <main className="flex flex-1 items-center justify-center px-6">
        <section className="w-full max-w-2xl">

          {/* TITLE */}
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary mb-2">
              Identity Verification
            </h2>
            <p className="text-slate-500 font-medium">
              Step {step === "aadhaar" ? "1" : step === "otp" ? "2" : "3"} of 3
            </p>
          </div>

          {/* STEP 1 */}
          {step === "aadhaar" && (
            <div className="space-y-6">
              <input
                type="text"
                placeholder="0000 0000 0000"
                value={aadhaar}
                onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                className="h-20 w-full border-4 border-slate-200 px-6 text-2xl font-black tracking-widest focus:border-primary focus:outline-none"
              />

              {error && <p className="text-red-600 font-bold uppercase">{error}</p>}

              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="h-20 w-full rounded-none bg-slate-900 text-2xl font-black uppercase tracking-widest text-white hover:bg-slate-800"
              >
                {loading ? "Sending..." : "Send OTP"}
                <ChevronRight className="ml-4 h-8 w-8" />
              </Button>
            </div>
          )}

          {/* STEP 2 */}
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
                {loading ? "Verifying..." : "Verify OTP"}
                <ChevronRight className="ml-4 h-8 w-8" />
              </Button>
            </div>
          )}

          {/* FACE STEP */}
          {step === "face" && (
            <div className="space-y-4">

              {/* Smaller Camera Frame */}
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
                {loading ? "Processing..." : "Complete Verification"}
              </Button>
            </div>
          )}

          {/* BACK */}
          <Button
            onClick={handleBack}
            variant="outline"
            className="mt-4 h-16 w-full rounded-none border-4 border-primary text-primary font-black 
uppercase 
    hover:bg-primary 
    hover:text-white
  "
          >
            Back
          </Button>


          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm font-medium text-slate-500">
            🔒 Your information is encrypted. We do not store Aadhaar or facial data.
          </div>

        </section>
      </main>
    </div>
  )
}
