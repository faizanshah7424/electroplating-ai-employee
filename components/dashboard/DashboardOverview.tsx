"use client"

import React, { useState } from "react"
import { ShieldCheck, Flame, Zap, Droplets, Thermometer, AlertTriangle, CheckCircle, Activity, Award, Settings, Layers, Clock } from "lucide-react"

// Static Mock Data representing the 5 required dashboards for the production line
const initialBaths = [
  {
    id: "bath-1",
    name: "Caustic Cleaning Bath",
    type: "NaOH Cleaning Stage 1",
    status: "Optimal",
    health: 98,
    metrics: [
      { label: "NaOH Concentration", value: "70 g/L", limit: "50–90 g/L", type: "chemical" },
      { label: "Bath Temperature", value: "70°C", limit: "60–80°C", type: "temp" },
      { label: "Immersion Duration", value: "10 min", limit: "5–15 min", type: "time" },
      { label: "Cleaning Quality", value: "Optimal", limit: "No oils/grease", type: "quality" }
    ]
  },
  {
    id: "bath-2",
    name: "Sulfuric Acid Activation",
    type: "Substrate Activation Stage 3",
    status: "Optimal",
    health: 96,
    metrics: [
      { label: "H2SO4 Concentration", value: "8.0% v/v", limit: "5.0–12.0%", type: "chemical" },
      { label: "Activation Temp", value: "25°C", limit: "20–30°C", type: "temp" },
      { label: "Activation Time", value: "60 sec", limit: "30–90 sec", type: "time" },
      { label: "Activation Quality", value: "Optimal", limit: "No smut/passivation", type: "quality" }
    ]
  },
  {
    id: "bath-3",
    name: "Semi-Bright Nickel Bath",
    type: "Ductile Undercoat Stage 5",
    status: "Optimal",
    health: 97,
    metrics: [
      { label: "Nickel Sulfate", value: "280 g/L", limit: "250–325 g/L", type: "chemical" },
      { label: "Nickel Chloride", value: "50 g/L", limit: "40–60 g/L", type: "chemical" },
      { label: "Boric Acid Buffer", value: "40 g/L", limit: "35–45 g/L", type: "chemical" },
      { label: "Acidity (pH)", value: "4.2", limit: "3.8–4.5", type: "ph" },
      { label: "Bath Temperature", value: "55°C", limit: "50–60°C", type: "temp" },
      { label: "Current Density", value: "3.0 A/dm²", limit: "2.0–4.0 A/dm²", type: "density" }
    ]
  },
  {
    id: "bath-4",
    name: "Bright Nickel Bath",
    type: "Luster Topcoat Stage 6",
    status: "Optimal",
    health: 95,
    metrics: [
      { label: "Brightener Control", value: "1.5 mL/L", limit: "1.0–2.5 mL/L", type: "chemical" },
      { label: "Nickel Sulfate", value: "270 g/L", limit: "240–300 g/L", type: "chemical" },
      { label: "Nickel Chloride", value: "60 g/L", limit: "40–80 g/L", type: "chemical" },
      { label: "Boric Acid Buffer", value: "40 g/L", limit: "35–45 g/L", type: "chemical" },
      { label: "Acidity (pH)", value: "4.4", limit: "4.0–4.8", type: "ph" },
      { label: "Bath Temperature", value: "58°C", limit: "50–65°C", type: "temp" },
      { label: "Current Density", value: "4.0 A/dm²", limit: "3.0–5.0 A/dm²", type: "density" }
    ]
  },
  {
    id: "bath-5",
    name: "Chrome Plating Bath",
    type: "Luster Oxide Stage 7",
    status: "Warning",
    health: 84,
    metrics: [
      { label: "Chromic Acid (CrO3)", value: "250 g/L", limit: "220–280 g/L", type: "chemical" },
      { label: "Sulfate Catalyst Ratio", value: "105:1", limit: "90:1–110:1", type: "chemical" },
      { label: "Bath Temperature", value: "42°C", limit: "40–45°C", type: "temp" },
      { label: "Current Density", value: "18.0 A/dm²", limit: "10.0–25.0 A/dm²", type: "density" }
    ],
    message: "Sulfate catalyst ratio shifting high (105:1). Recalibrate catalyst balance."
  }
]

const recentLogs = [
  { time: "20:30", part: "Motorcycle Rim", metal: "Chrome", status: "Passed", defect: "None", confidence: "98%" },
  { time: "19:15", part: "Silencer (Muffler)", metal: "Chrome", status: "Flagged", defect: "Burning", confidence: "92%" },
  { time: "18:00", part: "Handlebar", metal: "Bright Nickel", status: "Passed", defect: "None", confidence: "97%" },
  { time: "16:45", part: "Fender (Rear)", metal: "Bright Nickel", status: "Flagged", defect: "Peeling", confidence: "94%" },
  { time: "15:30", part: "Handlebar", metal: "Semi-Bright Nickel", status: "Passed", defect: "None", confidence: "96%" }
]

export default function DashboardOverview({ onSelectPartAndMetal }: { onSelectPartAndMetal: (part: string, metal: string) => void }) {
  const [baths] = useState(initialBaths)

  return (
    <div className="space-y-6">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Factory Floor Telemetry</h1>
          <p className="text-gray-400 text-sm mt-1">Live monitoring console for motorcycle electroplating tanks</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-semibold">
          <Activity className="w-4 h-4 animate-pulse" />
          Rectifiers Online
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151c2c] border border-gray-800 p-4 rounded-xl relative overflow-hidden group hover:border-gray-700 transition duration-300">
          <div className="absolute right-2 top-2 text-gray-800 group-hover:text-gray-700 transition-colors">
            <Award className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pass Yield Rate</p>
          <p className="text-3xl font-extrabold text-white mt-2">96.8%</p>
          <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
            <CheckCircle className="w-3.5 h-3.5" />
            +0.4% this shift
          </div>
        </div>

        <div className="bg-[#151c2c] border border-gray-800 p-4 rounded-xl relative overflow-hidden group hover:border-gray-700 transition duration-300">
          <div className="absolute right-2 top-2 text-gray-800 group-hover:text-gray-700 transition-colors">
            <Layers className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Active Plating Tanks</p>
          <p className="text-3xl font-extrabold text-white mt-2">5 / 5</p>
          <div className="flex items-center gap-1 text-blue-400 text-xs mt-2">
            <Settings className="w-3.5 h-3.5 animate-spin" />
            All rectifiers loaded
          </div>
        </div>

        <div className="bg-[#151c2c] border border-gray-800 p-4 rounded-xl relative overflow-hidden group hover:border-gray-700 transition duration-300">
          <div className="absolute right-2 top-2 text-gray-800 group-hover:text-gray-700 transition-colors">
            <Flame className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Output Today</p>
          <p className="text-3xl font-extrabold text-white mt-2">142 Parts</p>
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
            <span>Rims, Silencers, Handles</span>
          </div>
        </div>

        <div className="bg-[#151c2c] border border-gray-800 p-4 rounded-xl relative overflow-hidden group hover:border-gray-700 transition duration-300">
          <div className="absolute right-2 top-2 text-gray-800 group-hover:text-gray-700 transition-colors">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">AI Guard Status</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">Active</p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
            <CheckCircle className="w-3.5 h-3.5" />
            Rule-base loaded
          </div>
        </div>
      </div>

      {/* Bath Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {baths.map((bath) => {
          const isOptimal = bath.status === "Optimal"
          return (
            <div
              key={bath.id}
              className={`bg-[#151c2c] border rounded-xl overflow-hidden shadow-lg transition duration-300 hover:shadow-xl ${
                isOptimal ? "border-gray-800 hover:border-gray-700" : "border-amber-500/50 bg-[#1e1919]"
              }`}
            >
              {/* Bath Header */}
              <div className="px-5 py-4 border-b border-gray-800/60 flex justify-between items-center bg-black/20">
                <div>
                  <h3 className="font-bold text-white text-base">{bath.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">{bath.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isOptimal ? "bg-green-500 animate-pulse" : "bg-amber-500 animate-bounce"}`} />
                  <span className={`text-xs font-bold ${isOptimal ? "text-green-400" : "text-amber-400"}`}>
                    {bath.status} ({bath.health}% Health)
                  </span>
                </div>
              </div>

              {/* Bath Metrics Body */}
              <div className="p-5 grid grid-cols-2 gap-4">
                {bath.metrics.map((metric, idx) => {
                  let icon = <Activity className="w-5 h-5" />
                  if (metric.type === "chemical") icon = <Droplets className="w-5 h-5" />
                  if (metric.type === "temp") icon = <Thermometer className="w-5 h-5" />
                  if (metric.type === "time") icon = <Clock className="w-5 h-5" />
                  if (metric.type === "quality") icon = <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  if (metric.type === "ph") icon = <Activity className="w-5 h-5 text-blue-400" />
                  if (metric.type === "density") icon = <Zap className="w-5 h-5 text-purple-400 animate-pulse" />

                  let iconColorClass = "p-2 rounded-lg bg-blue-500/10 text-blue-400"
                  if (metric.type === "temp") iconColorClass = "p-2 rounded-lg bg-orange-500/10 text-orange-400"
                  if (metric.type === "time" || metric.type === "quality") iconColorClass = "p-2 rounded-lg bg-emerald-500/10 text-emerald-400"
                  if (metric.type === "density") iconColorClass = "p-2 rounded-lg bg-purple-500/10 text-purple-400"

                  return (
                    <div key={idx} className="flex items-center gap-3 bg-black/10 border border-gray-800/40 p-3 rounded-lg">
                      <div className={iconColorClass}>
                        {icon}
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-semibold">{metric.label}</span>
                        <span className="text-sm font-bold text-white block truncate">{metric.value}</span>
                        <span className="text-[10px] text-gray-500 block font-mono">Limit: {metric.limit}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Warning strip */}
              {!isOptimal && bath.message && (
                <div className="px-5 py-3 bg-amber-500/10 border-t border-amber-500/20 flex items-start gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Operational Warning:</span> {bath.message}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quality logs & presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quality Scan Logs */}
        <div className="bg-[#151c2c] border border-gray-800 rounded-xl p-5 shadow-lg lg:col-span-2">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Quality Control Scan Log
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300 font-mono">
              <thead className="text-xs uppercase bg-black/30 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3">Plating</th>
                  <th className="px-4 py-3">Scan Code</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {recentLogs.map((log, index) => {
                  const isPassed = log.status === "Passed"
                  return (
                    <tr key={index} className="hover:bg-black/10 transition duration-150">
                      <td className="px-4 py-3 text-gray-400">{log.time}</td>
                      <td className="px-4 py-3 font-semibold text-white">{log.part}</td>
                      <td className="px-4 py-3">{log.metal}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPassed ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {log.defect === "None" ? "OK / PASS" : `DEFECT: ${log.defect.toUpperCase()}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{log.confidence}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Action Presets */}
        <div className="bg-[#151c2c] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-2">Plating Planner Presets</h3>
            <p className="text-gray-400 text-xs mb-4">Quick launch process calculation cards for specific motorcycle configurations</p>
            
            <div className="space-y-2.5">
              <button 
                onClick={() => onSelectPartAndMetal("rim", "bright_nickel")}
                className="w-full flex justify-between items-center p-3 rounded-lg border border-gray-800 bg-black/20 hover:bg-black/40 hover:border-gray-700 transition duration-150 text-left text-sm"
              >
                <div>
                  <span className="font-bold text-white block">Motorcycle Rim</span>
                  <span className="text-xs text-gray-400">Bright Nickel duplex plating - Watts bath</span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 uppercase font-mono">Load</span>
              </button>

              <button 
                onClick={() => onSelectPartAndMetal("silencer", "chrome")}
                className="w-full flex justify-between items-center p-3 rounded-lg border border-gray-800 bg-black/20 hover:bg-black/40 hover:border-gray-700 transition duration-150 text-left text-sm"
              >
                <div>
                  <span className="font-bold text-white block">Silencer Exhaust</span>
                  <span className="text-xs text-gray-400">Hexavalent Chrome finish - extreme corrosion</span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 uppercase font-mono">Load</span>
              </button>

              <button 
                onClick={() => onSelectPartAndMetal("handle", "semi_bright_nickel")}
                className="w-full flex justify-between items-center p-3 rounded-lg border border-gray-800 bg-black/20 hover:bg-black/40 hover:border-gray-700 transition duration-150 text-left text-sm"
              >
                <div>
                  <span className="font-bold text-white block">Handlebars</span>
                  <span className="text-xs text-gray-400">Semi-Bright Nickel base layer</span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 uppercase font-mono">Load</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800/60 text-[10px] text-gray-400">
            Clicking a preset automatically copies standard dimensions and sets target metals in the Planner tab.
          </div>
        </div>
      </div>
    </div>
  )
}
