"use client"

import React, { useState } from "react"
import DashboardOverview from "@/components/dashboard/DashboardOverview"
import LineAnalyst from "@/components/line-analysis/LineAnalyst"
import PlatingCalculator from "@/components/calculator/PlatingCalculator"
import DefectScanner from "@/components/scanner/DefectScanner"
import EngineerChat from "@/components/chat/EngineerChat"
import { LayoutDashboard, Calculator, Scan, MessageSquare, ShieldAlert, Cpu, Layers } from "lucide-react"

type TabType = "dashboard" | "line_analyst" | "calculator" | "scanner" | "chat"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  
  // Shared state to allow pre-loading values from Dashboard presets into Plating Calculator
  const [presetPart, setPresetPart] = useState("rim")
  const [presetMetal, setPresetMetal] = useState("nickel")

  const handleSelectPreset = (part: string, metal: string) => {
    setPresetPart(part)
    setPresetMetal(metal)
    setActiveTab("calculator")
  }

  // Navigation Links array
  const navItems = [
    { id: "dashboard" as TabType, name: "Dashboard", icon: LayoutDashboard },
    { id: "line_analyst" as TabType, name: "Line Diagnostics", icon: Layers },
    { id: "calculator" as TabType, name: "Plating Planner", icon: Calculator },
    { id: "scanner" as TabType, name: "Defect Scanner", icon: Scan },
    { id: "chat" as TabType, name: "AI Engineer Chat", icon: MessageSquare }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] font-sans antialiased text-gray-200">
      
      {/* 🚀 TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#0c1220]/80 backdrop-blur-md border-b border-gray-800/80 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white">ELECTROPLATE <span className="text-blue-500 text-xs font-mono font-bold bg-blue-500/15 border border-blue-500/20 px-2 py-0.5 rounded-full ml-1.5">AI EMPLOYEE</span></h1>
          </div>
        </div>
        
        {/* Node status indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-black/35 px-3 py-1.5 rounded-lg border border-gray-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400">NODE-01: OK</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>SAFETY: IN EFFECT</span>
          </div>
        </div>
      </header>

      {/* 🛠️ MAIN APP SHELL */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar - Desktop / Tabbar - Mobile */}
        <aside className="w-full md:w-64 bg-[#0a0f1b] border-r md:border-b-0 border-b border-gray-800/60 flex flex-col justify-between shrink-0">
          {/* Navigation Menu */}
          <div className="p-4 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block px-3 mb-2">Operations</span>
            
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition shrink-0 w-full text-left ${
                      isActive
                        ? "bg-blue-600/10 border border-blue-500/20 text-white font-bold"
                        : "text-gray-400 hover:text-gray-200 hover:bg-black/10"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-gray-500"}`} />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer info (Desktop only) */}
          <div className="hidden md:block p-4 border-t border-gray-800/50 text-[10px] text-gray-550 bg-black/10">
            <span className="block font-bold">ELECTROPLATE CLIENT V2.0</span>
            <span className="block mt-0.5">Connected to active rectifiers. Complies with industrial chemistry activation specs.</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 bg-[#090d16] overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Render Active Component based on State */}
          {activeTab === "dashboard" && (
            <DashboardOverview onSelectPartAndMetal={handleSelectPreset} />
          )}

          {activeTab === "line_analyst" && (
            <LineAnalyst />
          )}

          {activeTab === "calculator" && (
            <PlatingCalculator initialPart={presetPart} initialMetal={presetMetal} />
          )}

          {activeTab === "scanner" && (
            <DefectScanner />
          )}

          {activeTab === "chat" && (
            <EngineerChat currentContext={{ part: presetPart, metal: presetMetal }} />
          )}
        </main>
      </div>
    </div>
  )
}