import { API_URL, authHeaders, getToken } from "../config"

export async function createLineItem(quote_id, material_name, quantity, unit, unit_price, total_price = null) {
  const res = await fetch(`${API_URL}/api/v1/line-items/`, {
    method: "POST",
    headers: authHeaders(getToken()),
    body: JSON.stringify({ quote_id, material_name, quantity, unit, unit_price, total_price })
  })
  return res.json()
}

export async function getLineItems(quote_id) {
  const res = await fetch(`${API_URL}/api/v1/line-items/?quote_id=${quote_id}`, {
    headers: authHeaders(getToken())
  })
  return res.json()
}

export async function updateLineItem(item_id, updates) {
  const res = await fetch(`${API_URL}/api/v1/line-items/${item_id}`, {
    method: "PATCH",
    headers: authHeaders(getToken()),
    body: JSON.stringify(updates)
  })
  return res.json()
}

export async function deleteLineItem(item_id) {
  const res = await fetch(`${API_URL}/api/v1/line-items/${item_id}`, {
    method: "DELETE",
    headers: authHeaders(getToken())
  })
  return res.json()
}