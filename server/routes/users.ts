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

export const getUser: RequestHandler = async (req, res) => {
  try {
    const idOrUsername = String(req.params.id || "");
    const { rows } = await query(
      `select id, name, username, email, avatar_url, cover_url, bio, created_at
         from users
        where id::text = $1 or username = $1
        limit 1`,
      [idOrUsername],
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json({ user: rows[0] });
  } catch (e) {
    res.status(500).json({ error: "Failed to load user" });
  }
};

export const getUserPosts: RequestHandler = async (req, res) => {
  try {
    const idOrUsername = String(req.params.id || "");
    const { rows } = await query(
      `select p.id, p.content, p.content_mode, p.image_url, p.video_url, p.type, p.monetized, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar
         from posts p join users u on u.id=p.user_id
        where u.id::text = $1 or u.username = $1
        order by p.created_at desc limit 50`,
      [idOrUsername],
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
    try { await query(`insert into notifications (id, user_id, type, data) values ($1,$2,'friend_request',$3)`, [randomUUID(), target, JSON.stringify({ from: sub })]); } catch {}
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
    try { await query(`insert into notifications (id, user_id, type, data) values ($1,$2,'friend_accept',$3)`, [randomUUID(), requester, JSON.stringify({ by: sub })]); } catch {}
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to accept" });
  }
};

export const requests: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `select u.id, u.name, u.avatar_url, f.created_at
         from friendships f join users u on u.id=f.user_id
        where f.friend_id=$1 and f.status='pending' order by f.created_at desc`,
      [sub]
    );
    res.json({ requests: rows });
  } catch { res.status(500).json({ error: "Failed" }); }
};

export const suggestions: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `select u.id, u.name, u.avatar_url from users u
        where u.id<>$1 and u.id not in (
          select friend_id from friendships where user_id=$1
          union all
          select user_id from friendships where friend_id=$1
        )
        order by random() limit 20`,
      [sub]
    );
    res.json({ users: rows });
  } catch { res.status(500).json({ error: "Failed" }); }
};

export const friendsList: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `select u.id, u.name, u.avatar_url from friendships f
        join users u on u.id = case when f.user_id=$1 then f.friend_id else f.user_id end
       where (f.user_id=$1 or f.friend_id=$1) and f.status='friends'`,
      [sub]
    );
    res.json({ friends: rows });
  } catch { res.status(500).json({ error: "Failed" }); }
};

export const unfriend: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const other = req.params.id;
    await query(`delete from friendships where (user_id=$1 and friend_id=$2) or (user_id=$2 and friend_id=$1)`, [sub, other]);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed" }); }
};
