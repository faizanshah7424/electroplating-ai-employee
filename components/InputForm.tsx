"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function InputForm({ onSubmit }: any) {
  const [form, setForm] = useState({
    part: "",
    area: "",
    current: "",
    problem: ""
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-4">
      <Input name="part" placeholder="Part (rim, silencer)" onChange={handleChange} />
      <Input name="area" placeholder="Area (dm²)" onChange={handleChange} />
      <Input name="current" placeholder="Current (A/dm²)" onChange={handleChange} />
      <Input name="problem" placeholder="Problem (burning, pitting)" onChange={handleChange} />
      <Input name="pH" placeholder="pH (e.g. 4)" onChange={handleChange} />
      <Input name="temp" placeholder="Temperature (°C)" onChange={handleChange} />

      <Button onClick={() => onSubmit(form)}>
        Analyze
      </Button>
    </div>
  )
}