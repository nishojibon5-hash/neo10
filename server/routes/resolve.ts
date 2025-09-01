import type { RequestHandler } from "express";

export const resolveUrl: RequestHandler = async (req, res) => {
  try {
    const url = String(req.query.url || "");
    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: "Invalid URL" });
    let ct = "";
    try {
      const head = await fetch(url, { method: "HEAD", redirect: "follow" as any });
      ct = String(head.headers.get("content-type") || "");
    } catch {}
    if (!ct) {
      try {
        const get = await fetch(url, { method: "GET", redirect: "follow" as any });
        ct = String(get.headers.get("content-type") || "");
      } catch {}
    }
    if (ct.startsWith("image/")) return res.json({ kind: "image", url });
    if (ct.startsWith("video/")) return res.json({ kind: "video", url });
    return res.json({ kind: "unknown", url, contentType: ct });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};
