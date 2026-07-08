// Re-export from existing api.js (kept for backwards compatibility)
export const testConnection = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`);
  return res.json();
};
