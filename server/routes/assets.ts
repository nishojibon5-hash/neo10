import type { RequestHandler } from "express";
import { query } from "../db";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

function authSub(req: any) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !JWT_SECRET) return null;
  try { const p = jwt.verify(token, JWT_SECRET) as { sub: string }; return p.sub; } catch { return null; }
}

export const uploadBase64: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { filename, mime_type, data } = req.body || {};
    if (!mime_type || !data) return res.status(400).json({ error: "Missing file data" });
    const id = randomUUID();
    const bytes = Buffer.from(String(data), "base64");
    await query(
      `insert into assets (id, user_id, filename, mime_type, bytes) values ($1,$2,$3,$4,$5)`,
      [id, sub, filename ?? null, mime_type, bytes]
    );
    res.json({ id, url: `/api/assets/${id}` });
  } catch (e) {
    res.status(500).json({ error: "Upload failed" });
  }
};

export const getAsset: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await query(`select mime_type, bytes from assets where id=$1 limit 1`, [id]);
    if (!rows[0]) return res.status(404).send("Not found");
    res.setHeader("Content-Type", rows[0].mime_type);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.end(rows[0].bytes);
  } catch {
    res.status(500).send("Error");
  }
};
