import { API_URL, getToken } from "../config"

export async function uploadFloorPlan(file) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(`${API_URL}/api/v1/boq/upload`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${getToken()}`
    },
    body: formData
  })
  return res.json()
}

export async function getBOQResults() {
  const res = await fetch(`${API_URL}/api/v1/boq/`, {
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${getToken()}`
    }
  })
  return res.json()
}

export async function generateShareLink(boq_id) {
  const res = await fetch(`${API_URL}/api/v1/boq/${boq_id}/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${getToken()}`
    }
  })
  return res.json()
}