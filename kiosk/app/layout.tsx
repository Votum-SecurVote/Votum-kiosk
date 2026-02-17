import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

/**
 * Metadata configuration for the Next.js application.
 * Defines title, description, and icons for SEO and PWA support.
 */
export const metadata: Metadata = {
  title: 'Secure E-Voting Kiosk | National Elections 2026',
  description: 'Secure, accessible, and government-grade digital voting platform with Aadhaar verification and facial recognition.',
  generator: 'v0.app',
  themeColor: '#0B3D91',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

/**
 * Root Layout Component.
 * Wraps the entire application with the HTML/Body structure.
 * Includes global fonts and analytics.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`font-sans antialiased overflow-hidden`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
