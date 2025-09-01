import type { RequestHandler } from "express";

export const mediaProxy: RequestHandler = async (req, res) => {
  try {
    const raw = String(req.query.url || "");
    const url = raw.startsWith("//") ? `https:${raw}` : raw;
    if (!/^https?:\/\//i.test(url)) return res.status(400).send("bad url");
    const upstream = await fetch(url, { redirect: "follow" as any });
    const ct = upstream.headers.get("content-type") || "application/octet-stream";
    if (!/^image\//i.test(ct) && !/^video\//i.test(ct)) return res.status(400).send("unsupported");
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch {
    res.status(500).send("proxy error");
  }
};
