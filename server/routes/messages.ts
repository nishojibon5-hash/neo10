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

export const ensureConversation: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const peer = req.params.userId;
    const a = sub < peer ? sub : peer;
    const b = sub < peer ? peer : sub;
    const { rows } = await query(`select * from conversations where user_a=$1 and user_b=$2 limit 1`, [a, b]);
    if (rows[0]) return res.json({ conversation: rows[0] });
    const id = randomUUID();
    await query(`insert into conversations (id, user_a, user_b) values ($1,$2,$3)`, [id, a, b]);
    res.json({ conversation: { id, user_a: a, user_b: b } });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};

export const listConversations: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `with last as (
         select conv_id, max(created_at) as last_at from messages group by conv_id
       )
       select c.id, c.user_a, c.user_b, l.last_at,
              u.id as peer_id, u.name as peer_name, u.avatar_url as peer_avatar
         from conversations c
         left join last l on l.conv_id=c.id
         join users u on u.id=(case when c.user_a=$1 then c.user_b else c.user_a end)
        where c.user_a=$1 or c.user_b=$1
        order by coalesce(l.last_at, c.created_at) desc`,
      [sub]
    );
    res.json({ conversations: rows });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};

export const listMessages: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const conv = req.params.id;
    const { rows } = await query(
      `select id, conv_id, sender_id, content, content_type, attachment_url, attachment_type, created_at
         from messages where conv_id=$1 order by created_at asc limit 200`,
      [conv]
    );
    res.json({ messages: rows });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};

export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const conv = req.params.id;
    const { content, content_type, attachment_url, attachment_type } = req.body || {};
    if (!content && !attachment_url) return res.status(400).json({ error: "Empty message" });
    const id = randomUUID();
    await query(
      `insert into messages (id, conv_id, sender_id, content, content_type, attachment_url, attachment_type)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [id, conv, sub, content ?? null, content_type ?? 'text', attachment_url ?? null, attachment_type ?? null]
    );
    res.json({ id });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};
