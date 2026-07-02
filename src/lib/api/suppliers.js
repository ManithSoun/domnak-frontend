import { API_URL, authHeaders, getToken } from "../config"

export async function getSuppliers() {
  const res = await fetch(`${API_URL}/api/v1/suppliers/`)
  return res.json()
}

export async function getSuppliersByMaterial(material_name) {
  const res = await fetch(`${API_URL}/api/v1/suppliers/${material_name}`)
  return res.json()
}

export async function trackClick(supplier_id) {
  const res = await fetch(`${API_URL}/api/v1/suppliers/${supplier_id}/click`, {
    method: "POST",
    headers: authHeaders(getToken())
  })
  return res.json()
}