import type { RequestHandler } from "express";
import { query } from "../db";
import { z } from "zod";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

function authSub(req: any) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !JWT_SECRET) return null;
  try { const p = jwt.verify(token, JWT_SECRET) as { sub: string }; return p.sub; } catch { return null; }
}

const createSchema = z.object({
  title: z.string().min(3),
  media_url: z.string().min(1).optional(), // allow relative like /api/assets/...
  media_type: z.enum(["image","video"]).optional(),
  destination_url: z.string().min(1).optional(), // allow relative/absolute
  locations: z.string().optional(),
  audience: z.string().optional(),
  budget: z.number().optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  payment_method: z.string().optional(),
  transaction_id: z.string().optional(),
  trial: z.boolean().optional(),
});

export const createAd: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const data = createSchema.parse(req.body);
    const id = randomUUID();
    const paid = Boolean(data.payment_method && data.transaction_id);
    const trialSelected = Boolean(data.trial);
    const status = (paid || trialSelected) ? "active" : "pending";
    const trialUntil = trialSelected ? new Date(Date.now() + 2 * 24 * 3600 * 1000) : null;
    await query(
      `insert into ads (id, user_id, title, media_url, media_type, destination_url, locations, audience, budget, start_at, end_at, status, trial_until, payment_method, transaction_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [id, sub, data.title, data.media_url ?? null, data.media_type ?? null, data.destination_url ?? null, data.locations ?? null, data.audience ?? null, data.budget ?? null, data.start_at ?? null, data.end_at ?? null, status, trialUntil, data.payment_method ?? null, data.transaction_id ?? null]
    );
    res.json({ id, status, trial_until: trialUntil });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Failed to create ad" });
  }
};

export const listMyAds: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `select a.*, coalesce(i.cnt,0) as impressions,
              case
                when a.trial_until is not null and now() > a.trial_until and (a.payment_method is null or a.transaction_id is null) then 'invoice_due'
                else a.status
              end as effective_status
         from ads a
         left join (select ad_id, count(*) as cnt from ad_impressions group by ad_id) i on i.ad_id=a.id
        where a.user_id=$1 order by a.created_at desc`,
      [sub]
    );
    res.json({ ads: rows });
  } catch {
    res.status(500).json({ error: "Failed to list ads" });
  }
};

export const getActiveAd: RequestHandler = async (_req, res) => {
  try {
    const { rows } = await query(
      `select * from ads
        where status='active'
          and (trial_until is null or now() <= trial_until)
          and (start_at is null or now() >= start_at)
          and (end_at is null or now() <= end_at)
        order by random() limit 1`
    );
    res.json({ ad: rows[0] || null });
  } catch {
    res.status(200).json({ ad: null });
  }
};

const impressionSchema = z.object({ placement: z.string().optional() });
export const addImpression: RequestHandler = async (req, res) => {
  try {
    const adId = req.params.id;
    const { placement } = impressionSchema.parse(req.body ?? {});
    const id = randomUUID();
    await query(`insert into ad_impressions (id, ad_id, placement) values ($1,$2,$3)`, [id, adId, placement ?? null]);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Failed" });
  }
};

const patchSchema = z.object({ status: z.enum(["active","paused","pending"]).optional(), payment_method: z.string().optional(), transaction_id: z.string().optional() });
export const patchAd: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const id = req.params.id;
    const data = patchSchema.parse(req.body ?? {});
    const paid = Boolean(data.payment_method && data.transaction_id);
    const status = paid ? 'active' : data.status ?? null;
    const { rows } = await query(`update ads set status=coalesce($1,status), payment_method=coalesce($2,payment_method), transaction_id=coalesce($3,transaction_id), trial_until=case when $2 is not null and $3 is not null then null else trial_until end where id=$4 and user_id=$5 returning *`, [status, data.payment_method ?? null, data.transaction_id ?? null, id, sub]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json({ ad: rows[0] });
  } catch {
    res.status(400).json({ error: "Failed" });
  }
};
