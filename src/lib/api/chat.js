import { API_URL, authHeaders, getToken } from "../config"

export async function chat(quote_id, message, history = []) {
  const res = await fetch(`${API_URL}/api/v1/chat/`, {
    method: "POST",
    headers: authHeaders(getToken()),
    body: JSON.stringify({ quote_id, message, history })
  })
  return res.text()
}