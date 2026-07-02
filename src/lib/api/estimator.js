import { API_URL } from "../config"

export async function estimateCost(floor_area, storeys, finishing, roof_type, location) {
  const res = await fetch(`${API_URL}/api/v1/estimator/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ floor_area, storeys, finishing, roof_type, location })
  })
  return res.json()
}