export const testConnection = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { status: "disconnected" };
  }
  try {
    const res = await fetch(`${apiUrl}/`);
    if (!res.ok) {
      return { status: "disconnected" };
    }
    return await res.json();
  } catch (error) {
    return { status: "disconnected" };
  }
};