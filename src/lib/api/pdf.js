import { API_URL, getToken } from "../config"

export async function uploadPDF(file) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(`${API_URL}/api/v1/pdf/upload`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${getToken()}`
    },
    body: formData
  })
  return res.json()
}