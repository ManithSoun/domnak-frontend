import { apiFetch } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiFetchWithRetry(endpoint, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await apiFetch(endpoint, options);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
}

// Re-export from existing api.js (kept for backwards compatibility)
export const testConnection = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`);
  return res.json();
};

export const sendInvite = async (email, message) => {
  const endpoint = "/connections/invite";
  console.log("[sendInvite] Starting invite to:", email);
  console.log("[sendInvite] API_URL:", API_URL, "endpoint:", endpoint);
  try {
    const result = await apiFetchWithRetry(endpoint, {
      method: "POST",
      body: JSON.stringify({ email, message }),
    });
    console.log("[sendInvite] Success:", result);
    return result;
  } catch (error) {
    console.error("[sendInvite] Failed:", error);
    throw error;
  }
};

export const listConnections = async () => {
  return apiFetchWithRetry("/connections/");
};

export const acceptInvite = async (inviteId) => {
  return apiFetchWithRetry("/connections/accept", {
    method: "POST",
    body: JSON.stringify({ invite_id: inviteId }),
  });
};

export const rejectInvite = async (inviteId) => {
  return apiFetchWithRetry("/connections/reject", {
    method: "POST",
    body: JSON.stringify({ invite_id: inviteId }),
  });
};

export const acceptInviteByToken = async (token) => {
  return apiFetchWithRetry(`/connections/accept-token?token=${token}`, {
    method: "POST",
  });
};

export const listContacts = async () => {
  return apiFetchWithRetry("/connections/contacts");
};

export const getMyShareLink = async () => {
  return apiFetchWithRetry("/connections/my-share-link");
};

export const getNotifications = async () => {
  return apiFetchWithRetry("/connections/notifications");
};

export const markNotificationRead = async (notificationId) => {
  return apiFetchWithRetry(`/connections/notifications/${notificationId}/read`, {
    method: "POST",
  });
};
