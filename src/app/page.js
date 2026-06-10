"use client"
import { useEffect, useState } from "react"
import { testConnection } from "@/lib/api"

export default function Home() {
  const [status, setStatus] = useState("checking...")

  useEffect(() => {
    testConnection().then(data => setStatus(data.status))
  }, [])

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Domnak</h1>
      <p>Backend status: {status}</p>
      <p>Backend and Frontend are connected</p>
    </main>
  )
}