import { apiFetch } from "./client";

// POST /api/line-items/
export async function createLineItem({ quoteId, materialName, quantity, unit, unitPrice, totalPrice }) {
  return apiFetch("/api/line-items/", {
    method: "POST",
    body: JSON.stringify({
      quote_id: quoteId,
      material_name: materialName,
      quantity,
      unit,
      unit_price: unitPrice,
      total_price: totalPrice,
    }),
  });
}

// GET /api/line-items/?quote_id=xxx
export async function getLineItems(quoteId) {
  return apiFetch(`/api/line-items/?quote_id=${quoteId}`);
}

// DELETE /api/line-items/{itemId}
export async function deleteLineItem(itemId) {
  return apiFetch(`/api/line-items/${itemId}`, {
    method: "DELETE",
  });
}
