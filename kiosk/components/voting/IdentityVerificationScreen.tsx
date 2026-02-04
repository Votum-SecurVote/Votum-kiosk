"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useVotingContext } from "@/components/voting/VotingContext"

export function IdentityVerificationScreen() {
  const { setScreen, setVerified } = useVotingContext()
  const [aadhaar, setAadhaar] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"aadhaar" | "otp" | "face">("aadhaar")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12)
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
  }

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaar(formatAadhaar(e.target.value))
    setError("")
  }

  const handleSendOtp = () => {
    if (aadhaar.replace(/\s/g, "").length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep("otp")
      setError("")
    }, 1500)
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep("face")
      startCamera()
      setError("")
    }, 1500)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera access to continue.")
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
    if (step === "otp") {
      setStep("aadhaar")
      setOtp("")
      setError("")
    } else if (step === "face") {
      setStep("otp")
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
      setCameraActive(false)
      setError("")
    } else {
      setScreen("welcome")
    }
  }

  return (
    <div className="kiosk-locked flex h-screen flex-col items-center justify-center bg-background px-6 py-8 animate-fade-in">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
            Identity Verification
          </h2>
          <p className="text-muted-foreground">
            {step === "aadhaar" &&
              "Enter your Aadhaar number to begin verification"}
            {step === "otp" && "Enter the OTP sent to your registered mobile"}
            {step === "face" && "Position your face in the frame for verification"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${step === "aadhaar" ? "bg-primary" : "bg-accent"
              }`}
          />
          <div className="h-1 w-8 bg-border" />
          <div
            className={`h-3 w-3 rounded-full ${step === "otp" ? "bg-primary" : "bg-muted"
              }`}
          />
          <div className="h-1 w-8 bg-border" />
          <div
            className={`h-3 w-3 rounded-full ${step === "face" ? "bg-primary" : "bg-muted"
              }`}
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Aadhaar Step */}
          {step === "aadhaar" && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="mb-3 block text-lg font-semibold text-foreground">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000"
                  value={aadhaar}
                  onChange={handleAadhaarChange}
                  className="touch-button w-full rounded-lg border-2 border-primary bg-input px-4 py-4 text-xl font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={14}
                  aria-label="Enter your 12-digit Aadhaar number"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-base text-destructive">
                  ⚠️ {error}
                </p>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="touch-button flex-1 h-14 text-base font-semibold bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSendOtp}
                  disabled={loading || aadhaar.replace(/\s/g, "").length !== 12}
                  className="touch-button flex-1 h-14 bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="mb-3 block text-lg font-semibold text-foreground">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    setError("")
                  }}
                  className="touch-button w-full rounded-lg border-2 border-primary bg-input px-4 py-4 text-4xl font-mono text-center text-foreground placeholder-muted-foreground tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={6}
                  aria-label="Enter the 6-digit OTP"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-base text-destructive">
                  ⚠️ {error}
                </p>
              )}
              <p className="text-center text-sm text-muted-foreground">
                OTP sent to your registered mobile number
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="touch-button flex-1 h-14 text-base font-semibold bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="touch-button flex-1 h-14 bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          )}

          {/* Face Verification Step */}
          {step === "face" && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-96 w-96 rounded-lg border-4 border-primary object-cover"
                  />
                  <div className="absolute inset-0 rounded-lg border-4 border-transparent" />
                </div>
              </div>

              <div className="rounded-lg bg-accent/10 p-4 text-center text-base text-accent-foreground">
                {loading ? "🔍 Verifying your face..." : "✓ Face detection ready"}
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-base text-destructive">
                  ⚠️ {error}
                </p>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="touch-button flex-1 h-14 text-base font-semibold bg-transparent"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCompleteFaceVerification}
                  disabled={loading}
                  className="touch-button flex-1 h-14 bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Complete Verification"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-12 rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          🔒 Your personal information is encrypted and secure. We do not store your
          Aadhaar number or facial data.
        </div>
      </div>

      <p className="sr-only">
        {step === "aadhaar" && "Enter your 12-digit Aadhaar number"}
        {step === "otp" && "Enter the 6-digit OTP"}
        {step === "face" && "Face verification in progress"}
      </p>
    </div>
  )
}
