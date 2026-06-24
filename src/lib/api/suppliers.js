import { apiFetch } from "./client";

// GET /api/suppliers/
export async function getSuppliers() {
  return apiFetch("/api/suppliers/");
}

// GET /api/suppliers/{materialName}
export async function getSuppliersByMaterial(materialName) {
  return apiFetch(`/api/suppliers/${materialName}`);
}

// POST /api/suppliers/{supplierId}/click
export async function trackSupplierClick(supplierId) {
  return apiFetch(`/api/suppliers/${supplierId}/click`, {
    method: "POST",
  });
}
