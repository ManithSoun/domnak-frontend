import { apiFetch } from "./client";

/** List users available for direct messaging. */
export function listUsers() {
  return apiFetch("/api/auth/users");
}
