// POST /api/pdf/upload
// Must use FormData (no JSON), file sent as binary
import { getToken } from "./client";

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/upload`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("domnak_session");
        window.dispatchEvent(new Event("domnak_login"));
        window.location.href = "/login?error=Session expired. Please log in again.";
        return;
      }
    }
    
    let errMsg = "PDF upload failed";
    if (errBody) {
      if (errBody.error && errBody.error.message) {
        errMsg = errBody.error.message;
      } else if (errBody.detail) {
        errMsg = typeof errBody.detail === "object" ? JSON.stringify(errBody.detail) : String(errBody.detail);
      }
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data.data || data;
}
