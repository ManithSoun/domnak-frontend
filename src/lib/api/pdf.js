// POST /api/pdf/upload
// Must use FormData (no JSON), file sent as binary
export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("access_token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/upload`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "PDF upload failed");
  }

  return res.json();
}
