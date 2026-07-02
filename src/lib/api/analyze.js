import { API_URL, authHeaders, getToken } from "../config"

export async function analyzeQuote(quote_id) {
  const res = await fetch(`${API_URL}/api/v1/analyze/${quote_id}`, {
    method: "POST",
    headers: authHeaders(getToken())
  })
  return res.json()
}

export async function getAnalysis(quote_id) {
  const res = await fetch(`${API_URL}/api/v1/analyze/${quote_id}`, {
    headers: authHeaders(getToken())
  })
  return res.json()
}