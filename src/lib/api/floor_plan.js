import { apiFetch } from "./client";


export async function getFloorPlans() {
  return apiFetch("/api/floor-plan/");
}

/**
 * Delete a floor plan by its backend UUID.
 */
export async function deleteFloorPlan(floorPlanId) {
  return apiFetch(`/api/floor-plan/${floorPlanId}`, {
    method: "DELETE",
  });
}
