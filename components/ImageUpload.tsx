"use client"

import { useState } from "react"
import { API_URL } from "@/lib/api"

export default function ImageUpload() {
  const [result, setResult] = useState("")
  const [confidence, setConfidence] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleUpload = async (e: any) => {
    try {
      const file = e.target.files[0]
      if (!file) return

      setLoading(true)
      setError("")
      setResult("")
      setConfidence(null)

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`${API_URL}/detect`, {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (!data.success) {
        setError("Detection failed")
        return
      }

      setResult(data.defect)
      setConfidence(data.confidence)

    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 border rounded-xl space-y-3">

      <input type="file" onChange={handleUpload} />

      {/* Loading */}
      {loading && (
        <p className="text-blue-500 font-semibold">
          Analyzing image...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 font-semibold">
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="mt-2">
          <p className="font-semibold text-green-600">
            Detected Defect: {result}
          </p>

          {confidence !== null && (
            <p className="text-sm text-gray-600">
              Confidence: {(confidence * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}

    </div>
  )
}