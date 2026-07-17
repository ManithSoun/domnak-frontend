import { apiFetch } from "./client";

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

/** Get the signed-in user's message threads. */
export function getConversations() {
  return apiFetchWithRetry("/messages/conversations");
}

/** Get a specific conversation with another user. */
export function getConversation(otherUserId) {
  if (!otherUserId) throw new Error("A conversation recipient is required.");
  return apiFetchWithRetry(`/messages/${encodeURIComponent(otherUserId)}`);
}

/** Send a message to a user. */
export function sendMessage(receiverId, content) {
  const trimmedContent = content?.trim();
  if (!receiverId) throw new Error("A message recipient is required.");
  if (!trimmedContent) throw new Error("A message cannot be empty.");
  return apiFetchWithRetry("/messages/", {
    method: "POST",
    body: JSON.stringify({
      receiver_id: receiverId,
      content: trimmedContent,
    }),
  });
}

/** Mark a message as read. */
export function markAsRead(messageId) {
  if (!messageId) throw new Error("A message ID is required.");
  return apiFetchWithRetry(`/messages/${encodeURIComponent(messageId)}/read`, {
    method: "PATCH",
  });
}

/** Get unread message count. */
export function getUnreadCount() {
  return apiFetchWithRetry("/messages/unread");
}

/** Delete a message. */
export function deleteMessage(messageId) {
  if (!messageId) throw new Error("A message ID is required.");
  return apiFetchWithRetry(`/messages/${encodeURIComponent(messageId)}`, {
    method: "DELETE",
  });
}