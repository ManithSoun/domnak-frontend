import { useState, useEffect } from "react"
import { getQuotes } from "@/lib/api/quotes"

export function useQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getQuotes()
      .then(data => {
        if (data.error) setError(data.error.message)
        else setQuotes(data.data || [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { quotes, loading, error, setQuotes }
}