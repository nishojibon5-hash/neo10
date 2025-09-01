import { getToken } from "./auth";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || "");
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    reader.onerror = () => reject(reader.error || new Error("read error"));
    reader.readAsDataURL(file);
  });
}

export async function uploadAsset(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  const res = await fetch("/api/assets/base64", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ filename: file.name, mime_type: file.type || "application/octet-stream", data: base64 }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }
  const data = await res.json();
  return data.url as string;
}
