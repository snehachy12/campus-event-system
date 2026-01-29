import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Festo - Campus Solution Platform",
  description: "Unified campus platform for students, teachers, and canteen management",
  generator: "Festo",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="dark">{children}</body>
    </html>
  )
}
