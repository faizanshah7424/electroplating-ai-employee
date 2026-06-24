"use client"

import React, { useState, useRef } from "react"
import { detectDefect, VisionResponse } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Upload, HelpCircle, RefreshCw, AlertTriangle, ShieldCheck, CheckSquare, Sparkles } from "lucide-react"

export default function DefectScanner() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanStep, setScanStep] = useState("")
  const [result, setResult] = useState<VisionResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      processFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setApiError("Selected file must be an image.")
      return
    }
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setResult(null)
    setApiError(null)
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  const runVisualScan = async () => {
    if (!file) return
    setLoading(true)
    setApiError(null)
    setResult(null)

    // Simulate scanning telemetry stages to visual-wow the user
    const stages = [
      "Decompressing image channels...",
      "Extracting surface reflectivity mapping...",
      "Identifying defect bounding boxes...",
      "Running convolutional neural network inference..."
    ]

    for (let i = 0; i < stages.length; i++) {
      setScanStep(stages[i])
      await new Promise((resolve) => setTimeout(resolve, 750))
    }

    try {
      const response = await detectDefect(file)
      setResult(response)
    } catch (err: any) {
      setApiError(err.message || "Failed to process visual scanning.")
    } finally {
      setLoading(false)
    }
  }

  const resetScanner = () => {
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setApiError(null)
  }

  const getDefectBadgeColor = (defect: string) => {
    switch (defect.toLowerCase()) {
      case "none":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "burning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "peeling":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "pitting":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Upload Zone & Preview Panel */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="bg-[#151c2c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Visual Inspection Scanner
            </CardTitle>
            <CardDescription className="text-gray-400">
              Upload photos of plated components (rims, handles, silencers) to diagnose defects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag Zone */}
            {!previewUrl ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerUpload}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col justify-center items-center text-center cursor-pointer min-h-[250px] transition duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-500/5 text-blue-400"
                    : "border-gray-800 hover:border-gray-700 bg-black/10 text-gray-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="p-3.5 bg-gray-800/40 rounded-full mb-3 text-gray-400 group-hover:text-white transition duration-200">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Drag & Drop Component Image</h3>
                <p className="text-gray-400 text-xs mt-1.5 max-w-xs">
                  Supports JPEG, PNG, BMP, and WEBP. Images are analyzed using local convolutional filters.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 border-gray-700 hover:border-gray-600 text-gray-300 font-bold px-4 py-1.5 rounded-lg text-xs"
                >
                  Select File
                </Button>
              </div>
            ) : (
              /* Preview Screen */
              <div className="space-y-4">
                <div className="relative rounded-xl border border-gray-800 bg-[#0d121f] overflow-hidden flex justify-center items-center max-h-[350px]">
                  {/* Image itself */}
                  <img
                    src={previewUrl}
                    alt="Plated component preview"
                    className="max-h-[350px] object-contain w-full"
                  />
                  
                  {/* Glowing Laser Sweep Line */}
                  {loading && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-laserSweep" />
                      {/* CSS Keyframe definition added inline below */}
                      <style>{`
                        @keyframes laserSweep {
                          0% { top: 0%; opacity: 0; }
                          10% { opacity: 1; }
                          90% { opacity: 1; }
                          100% { top: 100%; opacity: 0; }
                        }
                        .animate-laserSweep {
                          position: absolute;
                          animation: laserSweep 1.5s infinite linear;
                        }
                      `}</style>
                    </div>
                  )}
                </div>

                {/* Scan Button Trigger */}
                {!loading && !result && (
                  <div className="flex gap-3">
                    <Button
                      onClick={runVisualScan}
                      className="flex-1 bg-blue-600 hover:bg-blue-505 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      Initiate Diagnostic Scan
                    </Button>
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      className="border-gray-800 text-gray-300 hover:bg-black/20"
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {apiError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{apiError}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-6 space-y-6">
        {/* Placeholder before scanning */}
        {!result && !loading && (
          <div className="h-full min-h-[300px] border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-8 bg-black/10">
            <Upload className="w-12 h-12 text-gray-700 mb-3" />
            <h3 className="font-bold text-gray-400 text-base">Awaiting Defect Image</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm">
              Upload a photograph of the electroplated rim, fender, silencer, or handle on the left to see AI defect labels and confidence thresholds.
            </p>
          </div>
        )}

        {/* Loading display */}
        {loading && (
          <div className="h-full min-h-[350px] border border-gray-800 rounded-2xl flex flex-col justify-center items-center p-8 bg-[#151c2c] text-white">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <h3 className="font-bold text-lg">Visual Inspection Sweeping</h3>
            <p className="text-cyan-400 text-sm font-mono mt-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded">
              {scanStep}
            </p>
            <span className="text-xs text-gray-500 mt-4 block">Analyzing pixel grain density & gloss reflectivity...</span>
          </div>
        )}

        {/* Scan Result Details */}
        {result && (
          <Card className="bg-[#151c2c] border-gray-800 text-white shadow-xl animate-fadeIn">
            <CardHeader className="bg-black/15 pb-4 border-b border-gray-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Diagnostic Scan Results
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Metallurgical classification from visual data model
                </CardDescription>
              </div>
              <Button
                onClick={resetScanner}
                variant="outline"
                className="border-gray-800 text-gray-300 hover:bg-black/20 text-xs py-1 h-8"
              >
                Scan Another
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Defect Class & Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d121f] border border-gray-800/80 p-4 rounded-xl">
                  <span className="text-xs text-gray-500 block">Classified Defect</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 border ${getDefectBadgeColor(result.defect)}`}>
                    {result.defect.toUpperCase()}
                  </span>
                </div>
                <div className="bg-[#0d121f] border border-gray-800/80 p-4 rounded-xl">
                  <span className="text-xs text-gray-500 block">AI Confidence Score</span>
                  <span className="text-2xl font-bold text-white block mt-1.5 font-mono">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-black/20 border border-gray-800/40 p-4 rounded-xl">
                <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Visual Scan Description</h4>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">{result.description}</p>
              </div>

              {/* Playbook checklist */}
              <div className="space-y-3">
                <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                  Mitigation Checklist
                </h4>
                <div className="space-y-2">
                  {result.mitigation.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#0d121f] border border-gray-800 rounded-lg text-sm flex items-start gap-2.5 text-gray-300"
                    >
                      <span className="h-4 w-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-mono">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
