"use client"

import React from "react"
import PlatingCalculator from "@/components/calculator/PlatingCalculator"
import Link from "next/link"
import { ArrowLeft, Cpu } from "lucide-react"

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      {/* Mini header */}
      <header className="bg-[#0c1220] border-b border-gray-800/80 px-6 py-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-wider text-white">ELECTROPLATE <span className="text-blue-500 text-xs font-mono font-bold bg-blue-500/15 border border-blue-500/20 px-2 py-0.5 rounded-full ml-1.5">PLANNER</span></span>
        </Link>
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition bg-black/35 px-3 py-1.5 rounded-lg border border-gray-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard Console
        </Link>
      </header>

      {/* Calculator Body */}
      <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Dedicated Process Planner</h2>
          <p className="text-gray-400 text-sm mt-1">Direct access to Faraday calculations and chemistry diagnostics</p>
        </div>
        <PlatingCalculator />
      </main>
    </div>
  )
}
