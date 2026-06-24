import { apiFetch } from "./client";

// POST /api/quotes/
export async function createQuote({ contractorName, totalAmount }) {
  return apiFetch("/api/quotes/", {
    method: "POST",
    body: JSON.stringify({
      contractor_name: contractorName,
      total_amount: totalAmount,
    }),
  });
}

// GET /api/quotes/
export async function getQuotes() {
  return apiFetch("/api/quotes/");
}

// DELETE /api/quotes/{quoteId}
export async function deleteQuote(quoteId) {
  return apiFetch(`/api/quotes/${quoteId}`, {
    method: "DELETE",
  });
}
