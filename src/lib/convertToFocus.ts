/**
 * Normalizes a cloud billing CSV to FOCUS 1.3 standard using the Python backend.
 * Handles AWS/Azure schema alignment and ISO-8601 date formatting.
 */

const DATA_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/focus/convert" // Ensure this matches your @router.post path
    : "https://simulation-api-rsaw.onrender.com/api/focus/convert";

export async function convertToFocus(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(DATA_URL, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type header manually;
    // the browser needs to set the 'boundary' for multipart/form-data.
    headers: {
      Accept: "text/csv, application/octet-stream",
    },
  });

  if (!response.ok) {
    // If the backend returns a 500 or 400, it's usually a JSON error detail
    const errorBody = await response.json().catch(() => ({}));

    // Check for FastAPI's "detail" field specifically
    const errorMessage =
      errorBody.detail ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Returns the binary blob for the browser to trigger a download
  return await response.blob();
}
