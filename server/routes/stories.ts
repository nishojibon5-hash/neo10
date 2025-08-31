import type { RequestHandler } from "express";
import { query } from "../db";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

function authSub(req: any) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !JWT_SECRET) return null;
  try { const p = jwt.verify(token, JWT_SECRET) as { sub: string }; return p.sub; } catch { return null; }
}

export const listStories: RequestHandler = async (_req, res) => {
  try {
    const { rows } = await query(
      `select s.id, s.image_url, s.video_url, s.created_at, u.name, u.avatar_url
         from stories s join users u on u.id=s.user_id
        order by s.created_at desc limit 30`
    );
    res.json({ stories: rows });
  } catch {
    res.status(500).json({ stories: [] });
  }
};

export const createStory: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { image_url, video_url } = req.body || {};
    if (!image_url && !video_url) return res.status(400).json({ error: "Provide image_url or video_url" });
    const id = randomUUID();
    await query(`insert into stories (id, user_id, image_url, video_url) values ($1,$2,$3,$4)`, [id, sub, image_url ?? null, video_url ?? null]);
    res.json({ id });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};
