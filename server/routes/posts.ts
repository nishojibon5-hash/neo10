import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const getFeed: RequestHandler = async (_req, res) => {
  try {
    const { rows } = await query(
      `select p.id, p.content, p.image_url, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar,
              coalesce(l.likes,0) as likes, coalesce(c.comments,0) as comments
         from posts p
         join users u on u.id = p.user_id
         left join (
           select post_id, count(*) as likes from likes group by post_id
         ) l on l.post_id = p.id
         left join (
           select post_id, count(*) as comments from comments group by post_id
         ) c on c.post_id = p.id
        order by p.created_at desc
        limit 50`);
    res.json({ posts: rows });
  } catch (e) {
    res.status(500).json({ error: "Failed to load feed" });
  }
};

const createSchema = z.object({
  content: z.string().optional(),
  image_url: z.string().url().optional(),
});

export const createPost: RequestHandler = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const body = createSchema.parse(req.body);
    const { rows } = await query(
      `insert into posts (user_id, content, image_url) values ($1,$2,$3)
       returning id, created_at`,
      [payload.sub, body.content ?? null, body.image_url ?? null],
    );
    res.json({ id: rows[0].id });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Failed to create post" });
  }
};
