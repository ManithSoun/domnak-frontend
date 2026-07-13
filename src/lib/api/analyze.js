import { apiFetch } from "./client";

// POST /api/v1/analyze/{quoteId} 
export async function analyzeQuote(quoteId) {
  return apiFetch(`/api/v1/analyze/${quoteId}`, {
    method: "POST",
  });
}

// GET /api/v1/analyze/{quoteId} 
export async function getAnalysisResults(quoteId) {
  return apiFetch(`/api/v1/analyze/${quoteId}`);
}
