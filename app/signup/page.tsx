"use client"

import type React from "react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e78a53]/3 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e78a53]/2 rounded-full blur-3xl" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-20 text-zinc-400 hover:text-[#e78a53] transition-colors duration-200 flex items-center space-x-2 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Join ACE Campus
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Choose your role to get started with our comprehensive campus event platform
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-6xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Participant Card (Was Student) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Link href="/signup/participants" className="block h-full">
                <div className="h-full min-h-[500px] bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-12 hover:border-[#e78a53]/60 hover:bg-gradient-to-br hover:from-[#e78a53]/5 hover:to-zinc-800/60 transition-all duration-500 cursor-pointer text-center group-hover:shadow-2xl group-hover:shadow-[#e78a53]/20">
                  <div className="flex flex-col items-center gap-10 h-full justify-center">
                    {/* Icon Container */}
                    <div className="relative">
                      <div className="p-12 bg-gradient-to-br from-[#e78a53]/20 to-[#e78a53]/10 rounded-full group-hover:from-[#e78a53]/30 group-hover:to-[#e78a53]/20 transition-all duration-500 group-hover:scale-110">
                        {/* Users / Ticket Icon */}
                        <svg className="w-20 h-20 text-[#e78a53]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19 21v-2a4 4 0 0 0-3-3.87m-4-12a3.86 3.86 0 0 1 3 3.87V12m-8 0a3.86 3.86 0 0 0-3-3.87m-3 3v2a4 4 0 0 0 3 3.87m.05 6V21m0 0h12.9" />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <h3 className="text-4xl font-bold text-white group-hover:text-[#e78a53] transition-colors duration-300">
                        Participant
                      </h3>
                      <p className="text-zinc-300 text-lg leading-relaxed max-w-sm mx-auto">
                        Discover campus events, book tickets, view schedules, track your participation history, and join communities.
                      </p>

                      {/* CTA Button */}
                      <div className="mt-8">
                        <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#e78a53] to-[#e78a53]/80 text-white rounded-full text-lg font-semibold group-hover:from-[#e78a53]/90 group-hover:to-[#e78a53] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#e78a53]/25">
                          Get Started
                          <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Organizer Card (Was Teacher) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Link href="/signup/organizer" className="block h-full">
                <div className="h-full min-h-[500px] bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-12 hover:border-[#e78a53]/60 hover:bg-gradient-to-br hover:from-[#e78a53]/5 hover:to-zinc-800/60 transition-all duration-500 cursor-pointer text-center group-hover:shadow-2xl group-hover:shadow-[#e78a53]/20">
                  <div className="flex flex-col items-center gap-10 h-full justify-center">
                    {/* Icon Container */}
                    <div className="relative">
                      <div className="p-12 bg-gradient-to-br from-[#e78a53]/20 to-[#e78a53]/10 rounded-full group-hover:from-[#e78a53]/30 group-hover:to-[#e78a53]/20 transition-all duration-500 group-hover:scale-110">
                        {/* Briefcase / Calendar Icon */}
                        <svg className="w-20 h-20 text-[#e78a53]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <h3 className="text-4xl font-bold text-white group-hover:text-[#e78a53] transition-colors duration-300">
                        Organizer
                      </h3>
                      <p className="text-zinc-300 text-lg leading-relaxed max-w-sm mx-auto">
                        Create events, manage registrations, track analytics, coordinate volunteers, and oversee campus activities.
                      </p>

                      {/* CTA Button */}
                      <div className="mt-8">
                        <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#e78a53] to-[#e78a53]/80 text-white rounded-full text-lg font-semibold group-hover:from-[#e78a53]/90 group-hover:to-[#e78a53] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#e78a53]/25">
                          Get Started
                          <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Canteen Card (Unchanged) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Link href="/signup/canteen" className="block h-full">
                <div className="h-full min-h-[500px] bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-12 hover:border-[#e78a53]/60 hover:bg-gradient-to-br hover:from-[#e78a53]/5 hover:to-zinc-800/60 transition-all duration-500 cursor-pointer text-center group-hover:shadow-2xl group-hover:shadow-[#e78a53]/20">
                  <div className="flex flex-col items-center gap-10 h-full justify-center">
                    {/* Icon Container */}
                    <div className="relative">
                      <div className="p-12 bg-gradient-to-br from-[#e78a53]/20 to-[#e78a53]/10 rounded-full group-hover:from-[#e78a53]/30 group-hover:to-[#e78a53]/20 transition-all duration-500 group-hover:scale-110">
                        <svg className="w-20 h-20 text-[#e78a53]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.001 3.001 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.06 1.06 0 0 1 1.06 1.06l1.39 1.39c.354.353.354.927 0 1.28L19.682 7.22A1.5 1.5 0 0 1 18.622 8H5.378a1.5 1.5 0 0 1-1.06-1.06L3.75 6.349Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <h3 className="text-4xl font-bold text-white group-hover:text-[#e78a53] transition-colors duration-300">
                        Canteen
                      </h3>
                      <p className="text-zinc-300 text-lg leading-relaxed max-w-sm mx-auto">
                        Manage food stock, process orders, track queue system, and handle all canteen operations efficiently
                      </p>

                      {/* CTA Button */}
                      <div className="mt-8">
                        <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#e78a53] to-[#e78a53]/80 text-white rounded-full text-lg font-semibold group-hover:from-[#e78a53]/90 group-hover:to-[#e78a53] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#e78a53]/25">
                          Get Started
                          <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-zinc-400 text-lg">
            Already have an account?{" "}
            <Link href="/login" className="text-[#e78a53] hover:text-[#e78a53]/80 font-semibold transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}