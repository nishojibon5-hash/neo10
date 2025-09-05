import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { z } from "zod";
import { query } from "../db";
import { randomUUID } from "crypto";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1).max(5000),
  price: z.number().nonnegative().optional(),
  image_url: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  contact_phone: z.string().min(4).optional(),
});

export const listListings: RequestHandler = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();
    const params: any[] = [];
    const where: string[] = [];
    if (q) { params.push(`%${q}%`); where.push("title ilike $" + params.length); }
    if (category) { params.push(category); where.push("category = $" + params.length); }
    const sql = `select l.id, l.title, l.description, l.price, l.image_url, l.location, l.category, l.created_at,
                        u.id as user_id, u.name as user_name, coalesce(u.avatar_url,'') as user_avatar
                 from market_listings l join users u on u.id=l.user_id
                 ${where.length ? "where " + where.join(" and ") : ""}
                 order by l.created_at desc limit 100`;
    const { rows } = await query(sql, params);
    res.json({ listings: rows });
  } catch {
    res.status(500).json({ error: "Failed to load listings" });
  }
};

export const getListing: RequestHandler = async (req, res) => {
  try {
    const { rows } = await query(`select * from market_listings where id=$1 limit 1`, [req.params.id]);
    const listing = rows[0];
    if (!listing) return res.status(404).json({ error: "Not found" });
    res.json({ listing });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};

export const createListing: RequestHandler = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const body = createSchema.parse({
      ...req.body,
      price: req.body?.price != null ? Number(req.body.price) : undefined,
    });
    const id = randomUUID();
    await query(
      `insert into market_listings (id, user_id, title, description, price, image_url, location, category, contact_phone)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, payload.sub, body.title, body.description, body.price ?? null, body.image_url ?? null, body.location ?? null, body.category ?? null, body.contact_phone ?? null]
    );
    res.json({ id });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Failed to create" });
  }
};

export const deleteListing: RequestHandler = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const r = await query(`delete from market_listings where id=$1 and user_id=$2`, [req.params.id, payload.sub]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete" });
  }
};

export const listCategories: RequestHandler = async (_req, res) => {
  const cats = [
    "Mobiles",
    "Electronics",
    "Vehicles",
    "Property",
    "Jobs",
    "Services",
    "Home & Living",
    "Fashion",
    "Pets",
    "Hobbies & Sports",
  ];
  res.json({ categories: cats });
};
