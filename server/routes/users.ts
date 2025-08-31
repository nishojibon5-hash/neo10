import type { RequestHandler } from "express";
import { query } from "../db";
import jwt from "jsonwebtoken";

function authSub(req: any) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !JWT_SECRET) return null;
  try {
    const p = jwt.verify(token, JWT_SECRET) as { sub: string };
    return p.sub;
  } catch {
    return null;
  }
}

export const getUser: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await query(
      `select id, name, username, email, avatar_url, cover_url, bio, created_at from users where id=$1 or username=$1 limit 1`,
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json({ user: rows[0] });
  } catch {
    res.status(500).json({ error: "Failed to load user" });
  }
};

export const getUserPosts: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await query(
      `select p.id, p.content, p.content_mode, p.image_url, p.video_url, p.type, p.monetized, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar
         from posts p join users u on u.id=p.user_id where p.user_id=$1 order by p.created_at desc limit 50`,
      [id],
    );
    res.json({ posts: rows });
  } catch {
    res.status(500).json({ error: "Failed to load posts" });
  }
};

export const updateMe: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { name, username, avatar_url, cover_url, bio } = req.body || {};
    const { rows } = await query(
      `update users set name=coalesce($1,name), username=coalesce($2,username), avatar_url=coalesce($3,avatar_url), cover_url=coalesce($4,cover_url), bio=coalesce($5,bio)
       where id=$6 returning id, name, username, email, avatar_url, cover_url, bio`,
      [name ?? null, username ?? null, avatar_url ?? null, cover_url ?? null, bio ?? null, sub],
    );
    res.json({ user: rows[0] });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: "Username taken" });
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const follow: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const target = req.params.id;
    await query(
      `insert into friendships (user_id, friend_id, status) values ($1,$2,'pending')
       on conflict (user_id, friend_id) do update set status='pending'`,
      [sub, target],
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to follow" });
  }
};

export const accept: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const requester = req.params.id;
    await query(
      `update friendships set status='friends' where user_id=$1 and friend_id=$2`,
      [requester, sub],
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to accept" });
  }
};
