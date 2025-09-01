import type { RequestHandler } from "express";
import { query } from "../db";
import jwt from "jsonwebtoken";

function authSub(req: any) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !JWT_SECRET) return null;
  try { const p = jwt.verify(token, JWT_SECRET) as { sub: string }; return p.sub; } catch { return null; }
}

export const listNotifications: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(`select id, type, data, created_at from notifications where user_id=$1 order by created_at desc limit 100`, [sub]);
    res.json({ notifications: rows });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};
