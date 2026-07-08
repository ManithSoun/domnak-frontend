import { apiFetch } from "./client";

// POST /api/estimator/
export async function estimateCost({ floorArea, storeys, finishing, roofType, location }) {
  return apiFetch("/api/estimator/", {
    method: "POST",
    body: JSON.stringify({
      floor_area: floorArea,
      storeys,
      finishing,
      roof_type: roofType,
      location,
    }),
  });
}
