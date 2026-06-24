"use client"

import React, { useState, useEffect } from "react"
import { analyzeBath, analyzeLine, BathAnalysisResult, LineAnalysisResponse } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { RefreshCw, Play, ShieldAlert, CheckCircle, AlertTriangle, Layers, Settings, ChevronRight, Activity, Thermometer, Droplets, Clock, Zap } from "lucide-react"

// Types of steps in the visual flow
type StageType = "caustic_cleaning" | "rinse_1" | "acid_activation" | "rinse_2" | "semi_bright_nickel" | "bright_nickel" | "chrome_plating" | "inspection"

interface StageConfig {
  id: StageType
  name: string
  subtitle: string
  isChemicalBath: boolean
  defaultParams: Record<string, number>
}

const STAGES: StageConfig[] = [
  {
    id: "caustic_cleaning",
    name: "Caustic Cleaner",
    subtitle: "NaOH Tank 1",
    isChemicalBath: true,
    defaultParams: { naoh_conc: 70, temp: 70, time: 10 }
  },
  {
    id: "rinse_1",
    name: "Water Rinse",
    subtitle: "Overflow Tank",
    isChemicalBath: false,
    defaultParams: {}
  },
  {
    id: "acid_activation",
    name: "Acid pickle",
    subtitle: "H2SO4 Tank 2",
    isChemicalBath: true,
    defaultParams: { h2so4_conc: 8, temp: 25, time: 60 }
  },
  {
    id: "rinse_2",
    name: "Water Rinse",
    subtitle: "Cascade Tank",
    isChemicalBath: false,
    defaultParams: {}
  },
  {
    id: "semi_bright_nickel",
    name: "Semi-Bright Ni",
    subtitle: "Ductile Undercoat",
    isChemicalBath: true,
    defaultParams: { ni_sulfate: 280, ni_chloride: 50, boric_acid: 40, ph: 4.2, temp: 55, current_density: 3.0 }
  },
  {
    id: "bright_nickel",
    name: "Bright Nickel",
    subtitle: "Luster Topcoat",
    isChemicalBath: true,
    defaultParams: { brightener: 1.5, ni_sulfate: 270, ni_chloride: 60, boric_acid: 40, ph: 4.4, temp: 58, current_density: 4.0 }
  },
  {
    id: "chrome_plating",
    name: "Chrome Plating",
    subtitle: "CrO3 Catalyst",
    isChemicalBath: true,
    defaultParams: { chromic_acid: 250, sulfate_ratio: 100, temp: 42, current_density: 18.0 }
  },
  {
    id: "inspection",
    name: "QA Inspection",
    subtitle: "Final Finish",
    isChemicalBath: false,
    defaultParams: {}
  }
]

export default function LineAnalyst() {
  const [activeStage, setActiveStage] = useState<StageType>("caustic_cleaning")
  
  // Entire production line chemical levels state
  const [lineParams, setLineParams] = useState<Record<string, Record<string, number>>>({
    caustic_cleaning: { naoh_conc: 70, temp: 70, time: 10 },
    acid_activation: { h2so4_conc: 8, temp: 25, time: 60 },
    semi_bright_nickel: { ni_sulfate: 280, ni_chloride: 50, boric_acid: 40, ph: 4.2, temp: 55, current_density: 3.0 },
    bright_nickel: { brightener: 1.5, ni_sulfate: 270, ni_chloride: 60, boric_acid: 40, ph: 4.4, temp: 58, current_density: 4.0 },
    chrome_plating: { chromic_acid: 250, sulfate_ratio: 100, temp: 42, current_density: 18.0 }
  })

  const [partType, setPartType] = useState("rim")
  const [symptom, setSymptom] = useState("")

  const [loading, setLoading] = useState(false)
  const [bathResult, setBathResult] = useState<BathAnalysisResult | null>(null)
  const [lineResult, setLineResult] = useState<LineAnalysisResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Map to hold line status coloring per bath
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>({
    caustic_cleaning: "Optimal",
    rinse_1: "Optimal",
    acid_activation: "Optimal",
    rinse_2: "Optimal",
    semi_bright_nickel: "Optimal",
    bright_nickel: "Optimal",
    chrome_plating: "Optimal",
    inspection: "Optimal"
  })

  // Sync statuses if full line audit result is available
  useEffect(() => {
    if (lineResult) {
      const statuses: Record<string, string> = { ...stageStatuses }
      lineResult.baths.forEach((b) => {
        let key = ""
        if (b.bath.includes("Caustic")) key = "caustic_cleaning"
        else if (b.bath.includes("Acid")) key = "acid_activation"
        else if (b.bath.includes("Semi")) key = "semi_bright_nickel"
        else if (b.bath.includes("Bright")) key = "bright_nickel"
        else if (b.bath.includes("Chrome")) key = "chrome_plating"
        
        if (key) statuses[key] = b.status
      })
      setStageStatuses(statuses)
    }
  }, [lineResult])

  const handleParamChange = (field: string, val: string) => {
    const numericVal = parseFloat(val) || 0
    setLineParams((prev) => ({
      ...prev,
      [activeStage]: {
        ...prev[activeStage],
        [field]: numericVal
      }
    }))
  }

  const handleBathAudit = async () => {
    setLoading(true)
    setApiError(null)
    setLineResult(null)
    setBathResult(null)

    try {
      const result = await analyzeBath({
        bath_type: activeStage,
        part_type: partType,
        parameters: lineParams[activeStage],
        problem_symptom: symptom || undefined
      })
      setBathResult(result)
      
      // Update specific status locally
      setStageStatuses((prev) => ({
        ...prev,
        [activeStage]: result.status
      }))
    } catch (err: any) {
      setApiError(err.message || "Failed to process bath audit.")
    } finally {
      setLoading(false)
    }
  }

  const handleLineAudit = async () => {
    setLoading(true)
    setApiError(null)
    setBathResult(null)
    setLineResult(null)

    try {
      const result = await analyzeLine({
        part_type: partType,
        caustic_cleaning: lineParams.caustic_cleaning,
        acid_activation: lineParams.acid_activation,
        semi_bright_nickel: lineParams.semi_bright_nickel,
        bright_nickel: lineParams.bright_nickel,
        chrome_plating: lineParams.chrome_plating,
        problem_symptom: symptom || undefined
      })
      setLineResult(result)
    } catch (err: any) {
      setApiError(err.message || "Failed to process full-line audit.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status === "Critical") return "border-red-500 bg-red-500/10 text-red-400"
    if (status === "Warning") return "border-amber-500 bg-amber-500/10 text-amber-400"
    return "border-emerald-500 bg-emerald-500/10 text-emerald-400"
  }

  const getBadgeColor = (status: string) => {
    if (status === "Critical") return "bg-red-500/25 border-red-500/30 text-red-300"
    if (status === "Warning") return "bg-amber-500/25 border-amber-500/30 text-amber-300"
    return "bg-emerald-500/25 border-emerald-500/30 text-emerald-300"
  }

  const currentStageConfig = STAGES.find((s) => s.id === activeStage)

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Production Line Auditor</h1>
          <p className="text-gray-400 text-sm mt-1">Audit chemical components and troubleshoot the complete 8-stage plating sequence</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleLineAudit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 flex items-center gap-1.5 rounded-lg text-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Full-Line Audit
          </Button>
        </div>
      </div>

      {/* 🚀 PROCESS FLOW VISUALIZATION */}
      <Card className="bg-[#151c2c] border-gray-800 p-5">
        <CardContent className="p-0">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-3 font-mono">Process Flow Diagram</span>
          
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-1 overflow-x-auto pb-2 scrollbar-none">
            {STAGES.map((stage, idx) => {
              const isActive = activeStage === stage.id
              const status = stageStatuses[stage.id] || "Optimal"
              
              return (
                <React.Fragment key={stage.id}>
                  {/* Stage box */}
                  <button
                    onClick={() => {
                      setActiveStage(stage.id)
                      setBathResult(null)
                    }}
                    className={`flex-1 min-w-[140px] text-left p-3.5 border rounded-xl transition duration-200 ${
                      isActive 
                        ? "bg-blue-600/10 border-blue-500 shadow-md ring-1 ring-blue-500/20" 
                        : "bg-black/20 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-gray-500 font-mono font-bold">0{idx + 1}</span>
                      {stage.isChemicalBath && (
                        <span className={`h-2 w-2 rounded-full ${
                          status === "Critical" ? "bg-red-500" : status === "Warning" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                      )}
                    </div>
                    <h3 className="font-bold text-white text-xs mt-1.5 truncate">{stage.name}</h3>
                    <span className="text-[9px] text-gray-400 block truncate mt-0.5">{stage.subtitle}</span>
                  </button>
                  
                  {/* Connection arrow */}
                  {idx < STAGES.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-800 shrink-0 hidden lg:block" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Editor & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stage Parameter Editor (Left) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-[#151c2c] border-gray-800 text-white">
            <CardHeader className="border-b border-gray-800/60 pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                Parameter Monitor: {currentStageConfig?.name}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Audit or tweak values for the selected stage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Product and defect logs */}
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-800/40">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block font-mono">Product Profile</label>
                  <select
                    value={partType}
                    onChange={(e) => setPartType(e.target.value)}
                    className="w-full bg-[#0d121f] border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="rim">Rim (Rim component)</option>
                    <option value="silencer">Silencer (Exhaust muffler)</option>
                    <option value="handle">Handlebar (Tube bend)</option>
                    <option value="fender">Fender (Large surface)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block font-mono">QA Defect Symptom</label>
                  <select
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    className="w-full bg-[#0d121f] border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">No defects reported</option>
                    <option value="peeling">Peeling & adhesion loss</option>
                    <option value="burning">Burning & roughness</option>
                    <option value="pitting">Pitting cratering</option>
                    <option value="dull">Dull/Cloudy deposits</option>
                    <option value="streaks">Streaks or haze lines</option>
                    <option value="milky">Milky chrome finish</option>
                  </select>
                </div>
              </div>

              {/* Rinses & Informational Panel */}
              {!currentStageConfig?.isChemicalBath ? (
                <div className="p-8 text-center bg-black/10 rounded-xl border border-gray-800/40">
                  <Activity className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <h4 className="font-bold text-xs text-gray-400 uppercase">Informational Stage</h4>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                    This step does not utilize chemical adjustments. Rinsing cleans dragging chemistry, and final inspection verifies overall yields.
                  </p>
                </div>
              ) : (
                /* Chemical Inputs Form */
                <div className="space-y-4">
                  {Object.entries(lineParams[activeStage] || {}).map(([key, value]) => {
                    // Make readable labels and assign appropriate icon
                    let label = key.replace("_", " ").toUpperCase()
                    let icon = <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    let step = "1"
                    
                    if (key.includes("conc")) {
                      label = label.replace("CONC", "CONCENTRATION")
                      icon = <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    }
                    if (key.includes("temp")) {
                      icon = <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                    }
                    if (key.includes("time")) {
                      icon = <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    }
                    if (key.includes("density")) {
                      label = "CURRENT DENSITY"
                      icon = <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      step = "0.1"
                    }
                    if (key === "ph") {
                      label = "OPERATING PH"
                      step = "0.1"
                    }

                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-gray-400 font-bold uppercase flex items-center gap-1.5 font-mono">
                            {icon}
                            {label}
                          </label>
                        </div>
                        <Input
                          type="number"
                          step={step}
                          value={value}
                          onChange={(e) => handleParamChange(key, e.target.value)}
                          className="bg-[#0d121f] border-gray-800 text-white rounded-lg focus:border-blue-500"
                        />
                      </div>
                    )
                  })}

                  {/* Audit button for active bath */}
                  <Button
                    onClick={handleBathAudit}
                    disabled={loading}
                    className="w-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 font-bold py-2 rounded-lg text-xs"
                  >
                    Audit Selected Bath
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results / Audit Display (Right) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Waiting screen */}
          {!bathResult && !lineResult && !loading && (
            <div className="h-full min-h-[300px] border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-8 bg-black/10">
              <Layers className="w-12 h-12 text-gray-700 mb-3" />
              <h3 className="font-bold text-gray-400 text-base">Awaiting Audit Execution</h3>
              <p className="text-gray-500 text-xs mt-1 max-w-sm">
                Adjust parameters on the left and select either a single bath audit or run a full production line audit to detect defects and chemistry failures.
              </p>
            </div>
          )}

          {/* Loading display */}
          {loading && (
            <div className="h-full min-h-[350px] border border-gray-800 rounded-2xl flex flex-col justify-center items-center p-8 bg-[#151c2c] text-white">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
              <h3 className="font-bold text-lg">AI Plating Auditor at Work</h3>
              <p className="text-gray-400 text-sm mt-1 text-center font-mono max-w-xs">
                Auditing NaOH, H2SO4, Ni, and Cr ratios...
              </p>
            </div>
          )}

          {/* SINGLE BATH AUDIT REPORT */}
          {bathResult && (
            <div className="space-y-6 animate-fadeIn">
              <Card className="bg-[#151c2c] border-gray-800 text-white shadow-xl">
                <CardHeader className="bg-black/15 pb-4 border-b border-gray-800/60 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-white text-base">
                      Bath Diagnostic Report: {bathResult.bath}
                    </CardTitle>
                    <span className="text-[10px] text-gray-400 font-mono">Stage audit result</span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs border rounded-lg font-bold font-mono ${getStatusColor(bathResult.status)}`}>
                    STATUS: {bathResult.status.toUpperCase()}
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Confidence */}
                  <div className="flex items-center justify-between text-xs border-b border-gray-800/40 pb-3">
                    <span className="text-gray-400 font-semibold uppercase">Diagnosis Confidence</span>
                    <span className="font-bold text-blue-400 font-mono">{(bathResult.confidence * 100).toFixed(0)}%</span>
                  </div>

                  {/* Issues */}
                  <div>
                    <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 font-mono">Issues / Anomalies Detected</h4>
                    {bathResult.issues.length === 0 ? (
                      <div className="text-sm text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>All parameter variables optimal.</span>
                      </div>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        {bathResult.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 bg-black/10 p-2.5 rounded-lg border border-gray-850">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Root causes */}
                  {bathResult.root_causes.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 font-mono">Chemical Root Causes</h4>
                      <ul className="list-disc ml-4 text-xs text-gray-300 space-y-1 leading-relaxed">
                        {bathResult.root_causes.map((cause, idx) => (
                          <li key={idx}>{cause}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 font-mono">Mitigation Checklist</h4>
                    <div className="space-y-2">
                      {bathResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-3 bg-[#0d121f] border border-gray-800 rounded-lg text-xs flex items-start gap-2.5 text-gray-300">
                          <span className="h-4.5 w-4.5 bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[10px] rounded-full shrink-0 font-mono">
                            {idx + 1}
                          </span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          )}

          {/* FULL PRODUCTION LINE AUDIT REPORT */}
          {lineResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Overall Summary Card */}
              <Card className="bg-[#151c2c] border-gray-800 text-white shadow-xl">
                <CardHeader className="bg-black/15 pb-4 border-b border-gray-800/60 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-white text-base">Line Audit: {partType.toUpperCase()} Batch</CardTitle>
                    <CardDescription className="text-gray-400 text-xs font-mono">Overall line status summary</CardDescription>
                  </div>
                  <span className={`px-3 py-1 text-xs border rounded-lg font-bold font-mono ${getBadgeColor(lineResult.line_status)}`}>
                    LINE: {lineResult.line_status.toUpperCase()}
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* General health bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold uppercase">Overall Audit Confidence</span>
                      <span className="font-mono font-bold text-blue-400">{(lineResult.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${lineResult.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Predicted defects */}
                  <div>
                    <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 font-mono">Line-wide Defect Predictions</h4>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      {lineResult.overall_predicted_defects.map((defect, idx) => (
                        <div key={idx} className="p-3 bg-[#0d121f] border border-gray-850 rounded-lg flex items-start gap-2.5">
                          {lineResult.line_status === "Critical" ? (
                            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          ) : lineResult.line_status === "Warning" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          <span>{defect}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bath Grid status summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lineResult.baths.map((bathInfo, idx) => {
                  const isOptimal = bathInfo.status === "Optimal"
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border bg-[#0d121f]/50 transition duration-150 ${
                        bathInfo.status === "Critical" 
                          ? "border-red-500/50 bg-red-500/5 text-red-300"
                          : bathInfo.status === "Warning"
                            ? "border-amber-500/50 bg-amber-500/5 text-amber-300"
                            : "border-gray-800 hover:border-gray-700 text-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs text-white">{bathInfo.bath}</h4>
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          bathInfo.status === "Critical" ? "bg-red-500/20 text-red-400" : bathInfo.status === "Warning" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {bathInfo.status}
                        </span>
                      </div>
                      
                      {bathInfo.issues.length > 0 ? (
                        <p className="text-[10px] text-gray-400 mt-2 line-clamp-2">
                          <b>Anomalies:</b> {bathInfo.issues.join("; ")}
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-400/80 mt-2">
                          All variables optimal.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Master recommendations card */}
              <Card className="bg-[#151c2c] border-gray-800 text-white shadow-xl">
                <CardHeader className="bg-black/15 pb-4 border-b border-gray-800/60">
                  <CardTitle className="text-white text-base">Integrated Remedial Action Playbook</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">Priority sequence of mechanical & chemical corrections</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    {lineResult.overall_recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-[#0d121f] border border-gray-800 rounded-lg text-xs flex items-start gap-2.5 text-gray-300">
                        <span className="h-5 w-5 bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[10px] rounded-full shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

        </div>

      </div>
    </div>
  )
}
