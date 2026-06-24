"use client"

import React, { useState, useEffect } from "react"
import { analyzeProcess, ProcessRequest, ProcessResponse } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Calculator, AlertCircle, ShieldAlert, Sparkles, RefreshCw, Zap, Shield, HelpCircle } from "lucide-react"

// Metal recommendation ranges replicated from backend to provide client-side dynamic guidance
const METAL_METRICS: Record<string, { name: string; minCD: number; maxCD: number; minpH: number; maxpH: number; minTemp: number; maxTemp: number; defCD: number; defpH: number; defTemp: number; recThickness: number }> = {
  semi_bright_nickel: { name: "Semi-Bright Nickel", minCD: 2.0, maxCD: 4.0, minpH: 3.8, maxpH: 4.5, minTemp: 50, maxTemp: 60, defCD: 3.0, defpH: 4.2, defTemp: 55, recThickness: 15.0 },
  bright_nickel: { name: "Bright Nickel", minCD: 3.0, maxCD: 5.0, minpH: 4.0, maxpH: 4.8, minTemp: 50, maxTemp: 65, defCD: 4.0, defpH: 4.4, defTemp: 58, recThickness: 20.0 },
  chrome: { name: "Chrome Plating", minCD: 10.0, maxCD: 25.0, minpH: 0.0, maxpH: 1.0, minTemp: 40, maxTemp: 45, defCD: 18.0, defpH: 0.5, defTemp: 42, recThickness: 1.5 }
}

const PART_PRESETS: Record<string, { name: string; area: number }> = {
  rim: { name: "Motorcycle Rim", area: 15.5 },
  silencer: { name: "Silencer (Muffler)", area: 22.0 },
  handle: { name: "Handlebar", area: 6.2 },
  fender: { name: "Rear Fender", area: 18.0 }
}

interface PlatingCalculatorProps {
  initialPart?: string;
  initialMetal?: string;
}

export default function PlatingCalculator({ initialPart = "rim", initialMetal = "bright_nickel" }: PlatingCalculatorProps) {
  const [part, setPart] = useState(initialPart)
  const [metal, setMetal] = useState(initialMetal)
  const [area, setArea] = useState("")
  const [thickness, setThickness] = useState("")
  const [currentDensity, setCurrentDensity] = useState("")
  const [pH, setpH] = useState("")
  const [temp, setTemp] = useState("")
  const [problem, setProblem] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Sync inputs when presets are loaded or metal changes
  useEffect(() => {
    const limits = METAL_METRICS[metal]
    if (limits) {
      setCurrentDensity(limits.defCD.toString())
      setpH(limits.defpH.toString())
      setTemp(limits.defTemp.toString())
      setThickness(limits.recThickness.toString())
    }
  }, [metal])

  useEffect(() => {
    const preset = PART_PRESETS[part]
    if (preset) {
      setArea(preset.area.toString())
    }
  }, [part])

  // Handle external loading preset triggers
  useEffect(() => {
    if (initialPart) setPart(initialPart)
    if (initialMetal) setMetal(initialMetal)
  }, [initialPart, initialMetal])

  const applyPreset = (key: string) => {
    setPart(key)
  }

  const handleCalculate = async () => {
    setLoading(true)
    setApiError(null)
    setResult(null)

    const payload: ProcessRequest = {
      part,
      metal,
      area: parseFloat(area) || 0,
      thickness: parseFloat(thickness) || 0,
      current_density: parseFloat(currentDensity) || 0,
      pH: pH ? parseFloat(pH) : undefined,
      temp: temp ? parseFloat(temp) : undefined,
      problem: problem || undefined
    }

    try {
      const response = await analyzeProcess(payload)
      setResult(response)
    } catch (err: any) {
      setApiError(err.message || "Failed to contact process server.")
    } finally {
      setLoading(false)
    }
  }

  const currentLimits = METAL_METRICS[metal]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Inputs Column */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="bg-[#151c2c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calculator className="w-5 h-5 text-blue-400" />
              Process Planner & Inputs
            </CardTitle>
            <CardDescription className="text-gray-400">
              Define part details and chemical environment parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Part Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-bold uppercase">Component Type</label>
              <select
                value={part}
                onChange={(e) => setPart(e.target.value)}
                className="w-full bg-[#0d121f] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="rim">Motorcycle Rim</option>
                <option value="silencer">Silencer / Muffler</option>
                <option value="handle">Handlebar</option>
                <option value="fender">Fender</option>
              </select>
              {/* Preset buttons */}
              <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
                {Object.entries(PART_PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    className={`text-[10px] px-2 py-1 rounded border font-mono shrink-0 transition ${
                      part === key 
                        ? "bg-blue-500/20 border-blue-400 text-blue-400 font-bold" 
                        : "bg-black/10 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    {item.name} ({item.area} dm²)
                  </button>
                ))}
              </div>
            </div>

            {/* Plating Metal Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-bold uppercase">Plating Chemistry Bath</label>
              <select
                value={metal}
                onChange={(e) => setMetal(e.target.value)}
                className="w-full bg-[#0d121f] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="semi_bright_nickel">Semi-Bright Nickel</option>
                <option value="bright_nickel">Bright Nickel</option>
                <option value="chrome">Chrome Plating</option>
              </select>
            </div>

            {/* Area and Thickness */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase">Plating Area (dm²)</label>
                <Input
                  type="number"
                  placeholder="e.g. 15.5"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="bg-[#0d121f] border-gray-800 text-white rounded-lg focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase">Thickness (microns)</label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  className="bg-[#0d121f] border-gray-800 text-white rounded-lg focus:border-blue-500"
                />
              </div>
            </div>

            {/* Current Density Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-gray-400 font-bold uppercase">Current Density (A/dm²)</label>
                <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  {currentDensity || "0"} A/dm²
                </span>
              </div>
              <input
                type="range"
                min={Math.max(0.1, (currentLimits?.minCD || 1) - 5)}
                max={(currentLimits?.maxCD || 10) + 10}
                step="0.1"
                value={currentDensity}
                onChange={(e) => setCurrentDensity(e.target.value)}
                className="w-full h-1.5 bg-[#0d121f] border border-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>Min Safe: {currentLimits?.minCD} A/dm²</span>
                <span>Max Safe: {currentLimits?.maxCD} A/dm²</span>
              </div>
            </div>

            {/* pH and Temp */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase">Bath pH</label>
                <Input
                  type="number"
                  placeholder="e.g. 4.0"
                  value={pH}
                  onChange={(e) => setpH(e.target.value)}
                  className="bg-[#0d121f] border-gray-800 text-white rounded-lg focus:border-blue-500"
                />
                <span className="text-[10px] text-gray-500 block font-mono">Rec: {currentLimits?.minpH}–{currentLimits?.maxpH}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase">Temperature (°C)</label>
                <Input
                  type="number"
                  placeholder="e.g. 55"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="bg-[#0d121f] border-gray-800 text-white rounded-lg focus:border-blue-500"
                />
                <span className="text-[10px] text-gray-500 block font-mono">Rec: {currentLimits?.minTemp}–{currentLimits?.maxTemp}°C</span>
              </div>
            </div>

            {/* Symptom Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-bold uppercase">Active Bath Defect / Symptom</label>
              <select
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full bg-[#0d121f] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">None (Optimal Plating)</option>
                <option value="burning">Burning at high-current areas</option>
                <option value="pitting">Pitting & micro-cratering</option>
                <option value="peeling">Peeling & adhesion failure</option>
                <option value="dull">Dull Finish / Lack of gloss</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                onClick={handleCalculate}
                disabled={loading || !area || !currentDensity}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 flex items-center justify-center gap-2 rounded-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calculating Faraday parameters...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    Compute & Troubleshoot
                  </>
                )}
              </Button>
            </div>
            {apiError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outputs Column */}
      <div className="lg:col-span-7 space-y-6">
        {!result && !loading && (
          <div className="h-full min-h-[300px] border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-8 bg-black/10">
            <Calculator className="w-12 h-12 text-gray-700 mb-3" />
            <h3 className="font-bold text-gray-400 text-base">Awaiting Physics Telemetry</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm">
              Input component details and bath readings on the left, then click Calculate to view process timings, yields, and diagnostic remedies.
            </p>
          </div>
        )}

        {loading && (
          <div className="h-full min-h-[400px] border border-gray-800 rounded-2xl flex flex-col justify-center items-center p-8 bg-[#151c2c] text-white">
            <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <h3 className="font-bold text-lg">Running Plating Calculations</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs text-center font-mono">
              Solving Faraday's constant: 96,485 C/mol...
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Primary Physics Card */}
            <Card className="bg-[#151c2c] border-gray-800 text-white shadow-xl">
              <CardHeader className="bg-black/15 pb-4 border-b border-gray-800/60">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Calculated Plating Specifications
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-mono text-xs">
                      Chemical target: {result.inputs.metal?.toUpperCase()} on {result.inputs.part?.toUpperCase()}
                    </CardDescription>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-400 px-2.5 py-1 border border-green-500/20 font-bold rounded-lg uppercase">
                    Validated
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Numeric Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Plating Time */}
                  <div className="bg-[#0d121f] border border-gray-800/80 p-5 rounded-xl text-center">
                    <span className="text-xs text-gray-400 font-semibold block uppercase">Estimated Plating Time</span>
                    <p className="text-4xl font-extrabold text-white mt-2 font-mono">
                      {result.time_minutes}
                    </p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">Minutes total duration</span>
                  </div>

                  {/* Rectifier Load */}
                  <div className="bg-[#0d121f] border border-gray-800/80 p-5 rounded-xl text-center">
                    <span className="text-xs text-gray-400 font-semibold block uppercase">Total Rectifier Current</span>
                    <p className="text-4xl font-extrabold text-blue-400 mt-2 font-mono flex items-center justify-center gap-1">
                      <Zap className="w-5 h-5 shrink-0 text-blue-400" />
                      {result.total_current_amps}
                    </p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">Amperes (A) continuous</span>
                  </div>

                  {/* Deposited Mass */}
                  <div className="bg-[#0d121f] border border-gray-800/80 p-5 rounded-xl text-center">
                    <span className="text-xs text-gray-400 font-semibold block uppercase">Metal Yield Mass</span>
                    <p className="text-4xl font-extrabold text-emerald-400 mt-2 font-mono">
                      {result.deposited_mass_grams}g
                    </p>
                    <span className="text-[10px] text-gray-500 mt-1 block">Mass of cathode deposit</span>
                  </div>
                </div>

                {/* Physics Telemetry Input Summary */}
                <div className="bg-black/20 p-4 border border-gray-800/40 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Input Checksheet</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500 block">Surface Area:</span>
                      <span className="text-white font-bold">{result.inputs.area} dm²</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Thickness:</span>
                      <span className="text-white font-bold">{result.inputs.thickness} µm</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bath pH:</span>
                      <span className="text-white font-bold">{result.inputs.pH ?? "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bath Temp:</span>
                      <span className="text-white font-bold">{result.inputs.temperature ?? "N/A"} °C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnostics Advice Card */}
            <Card className="bg-[#151c2c] border-gray-800 text-white shadow-xl overflow-hidden">
              <CardHeader className="bg-black/15 pb-4 border-b border-gray-800/60">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                  Engineering Diagnosis & Mitigation Playbook
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-generated troubleshooting checklist based on telemetry anomalies and visual defects
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Advice List */}
                <div className="space-y-2">
                  {result.advice.map((item, index) => {
                    const isCritical = item.startsWith("CRITICAL:") || item.toLowerCase().includes("risk is critical") || item.toLowerCase().includes("peeling")
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-sm flex items-start gap-2.5 ${
                          isCritical 
                            ? "bg-red-500/10 border border-red-500/20 text-red-300"
                            : item.toLowerCase().includes("density") || item.toLowerCase().includes("limits")
                              ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                              : "bg-[#0d121f] border border-gray-800 text-gray-300"
                        }`}
                      >
                        {isCritical ? (
                          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        )}
                        <span>{item}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
