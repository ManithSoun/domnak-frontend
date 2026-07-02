import { API_URL, authHeaders, getToken } from "../config"

export async function createQuote(contractor_name, total_amount) {
  const res = await fetch(`${API_URL}/api/v1/quotes/`, {
    method: "POST",
    headers: authHeaders(getToken()),
    body: JSON.stringify({ contractor_name, total_amount })
  })
  return res.json()
}

export async function getQuotes() {
  const res = await fetch(`${API_URL}/api/v1/quotes/`, {
    headers: authHeaders(getToken())
  })
  return res.json()
}

export async function getQuote(quote_id) {
  const res = await fetch(`${API_URL}/api/v1/quotes/${quote_id}`, {
    headers: authHeaders(getToken())
  })
  return res.json()
}

export async function updateQuote(quote_id, contractor_name, total_amount) {
  const res = await fetch(`${API_URL}/api/v1/quotes/${quote_id}`, {
    method: "PATCH",
    headers: authHeaders(getToken()),
    body: JSON.stringify({ contractor_name, total_amount })
  })
  return res.json()
}

export async function deleteQuote(quote_id) {
  const res = await fetch(`${API_URL}/api/v1/quotes/${quote_id}`, {
    method: "DELETE",
    headers: authHeaders(getToken())
  })
  return res.json()
}