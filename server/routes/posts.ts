import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db";
import { randomUUID } from "crypto";


export const getFeed: RequestHandler = async (_req, res) => {
  try {
    const { rows } = await query(
      `select p.id, p.content, p.content_mode, p.image_url, p.video_url, p.type, p.monetized, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar,
              coalesce(l.likes,0) as likes, coalesce(c.comments,0) as comments
         from posts p
         join users u on u.id = p.user_id
         left join (
           select post_id, count(*) as likes from reactions group by post_id
         ) l on l.post_id = p.id
         left join (
           select post_id, count(*) as comments from comments group by post_id
         ) c on c.post_id = p.id
        order by p.created_at desc
        limit 50`);
    res.json({ posts: rows });
  } catch (e) {
    console.error('getFeed error', e);
    // Fallback: return empty feed instead of error to keep UI working
    res.status(200).json({ posts: [] });
  }
};

export const listComments: RequestHandler = async (req, res) => {
  try {
    const postId = req.params.id;
    const { rows } = await query(
      `select c.id, c.content, c.created_at,
              u.id as user_id, u.name as user_name, coalesce(u.avatar_url,'') as user_avatar
         from comments c join users u on u.id=c.user_id
        where c.post_id=$1 order by c.created_at asc limit 100`,
      [postId],
    );
    res.json({ comments: rows });
  } catch {
    res.status(500).json({ error: "Failed to load comments" });
  }
};

const addCommentSchema = z.object({ content: z.string().min(1).max(2000) });
export const addComment: RequestHandler = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const { content } = addCommentSchema.parse(req.body);
    const id = randomUUID();
    await query(
      `insert into comments (id, user_id, post_id, content) values ($1,$2,$3,$4)`,
      [id, payload.sub, req.params.id, content],
    );
    res.json({ id });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Failed to comment" });
  }
};

const createSchema = z.object({
  content: z.string().optional(),
  content_mode: z.enum(["text","html"]).default("text"),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  type: z.enum(["post","video","reel"]).default("post"),
  monetized: z.boolean().default(false),
});

export const createPost: RequestHandler = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const body = createSchema.parse(req.body);
    const id = randomUUID();
    const { rows } = await query(
      `insert into posts (id, user_id, content, content_mode, image_url, video_url, type, monetized)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning id, created_at`,
      [id, payload.sub, body.content ?? null, body.content_mode, body.image_url ?? null, body.video_url ?? null, body.type, body.monetized],
    );
    res.json({ id: rows[0].id });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Failed to create post" });
  }
};

const reactSchema = z.object({ type: z.enum(["😆","🥲","🫦","🥴","😡","♥️","🤔","😮"]) });

export const reactPost: RequestHandler = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const { type } = reactSchema.parse(req.body);
    const postId = req.params.id;
    const existed = await query(`select 1 from reactions where user_id=$1 and post_id=$2 limit 1`, [payload.sub, postId]);
    await query(
      `insert into reactions (user_id, post_id, type)
       values ($1,$2,$3)
       on conflict (user_id, post_id) do update set type=excluded.type`,
      [payload.sub, postId, type],
    );
    try {
      const { rows } = await query(`select user_id from posts where id=$1`, [postId]);
      const owner = rows?.[0]?.user_id;
      if (owner && owner !== payload.sub) {
        const { randomUUID } = await import('crypto');
        await query(`insert into notifications (id, user_id, type, data) values ($1,$2,'reaction', $3)`, [randomUUID(), owner, JSON.stringify({ post_id: postId, by: payload.sub, type })]);
      }
    } catch {}
    res.json({ ok: true, created: existed.rowCount === 0, type });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Failed to react" });
  }
};

export const unreactPost: RequestHandler = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const postId = req.params.id;
    await query(`delete from reactions where user_id=$1 and post_id=$2`, [payload.sub, postId]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to remove reaction" });
  }
};
