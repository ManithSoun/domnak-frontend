import { apiFetch } from "./client";

// POST /api/quotes/
export async function createQuote({ contractorName, totalAmount, projectName, qualityTier, projectDetails, rooms }) {
  return apiFetch("/api/quotes/", {
    method: "POST",
    body: JSON.stringify({
      contractor_name: contractorName,
      total_amount: totalAmount,
      project_name: projectName,
      quality_tier: qualityTier,
      project_details: projectDetails,
      rooms: rooms || [],
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

// PATCH /api/quotes/{quoteId}
export async function updateQuote(quoteId, { contractorName, totalAmount, projectName, qualityTier, projectDetails, rooms }) {
  return apiFetch(`/api/quotes/${quoteId}`, {
    method: "PATCH",
    body: JSON.stringify({
      contractor_name: contractorName,
      total_amount: totalAmount,
      project_name: projectName,
      quality_tier: qualityTier,
      project_details: projectDetails,
      rooms: rooms || [],
    }),
  });
}
