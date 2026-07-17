import { apiFetch } from "./client";

// POST /api/v1/analyze/{quoteId} 
export async function analyzeQuote(quoteId) {
  return apiFetch(`/api/v1/analyze/${quoteId}`, {
    method: "POST",
  });
}

// GET /api/v1/analyze/{quoteId} - returns null if no analysis exists yet
export async function getAnalysisResults(quoteId) {
  try {
    const res = await apiFetch(`/api/v1/analyze/${quoteId}`);
    return res;
  } catch (e) {
    // Returns null if no analysis exists yet
    return null;
  }
}
