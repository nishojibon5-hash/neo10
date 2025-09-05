import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { z } from "zod";
import { query } from "../db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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

export const seedDemo: RequestHandler = async (_req, res) => {
  try {
    const password_hash = await bcrypt.hash("demo1234", 8);
    const sellers = [
      { name: "Rahim Electronics", avatar: "https://i.pravatar.cc/100?img=5" },
      { name: "Karim Motors", avatar: "https://i.pravatar.cc/100?img=12" },
      { name: "Nabila Mobile Shop", avatar: "https://i.pravatar.cc/100?img=32" },
      { name: "City Property", avatar: "https://i.pravatar.cc/100?img=41" },
      { name: "Daily Bazaar", avatar: "https://i.pravatar.cc/100?img=54" },
    ];

    const sellerIds: string[] = [];
    for (const s of sellers) {
      const id = randomUUID();
      sellerIds.push(id);
      await query(
        `insert into users (id, name, password_hash, avatar_url) values ($1,$2,$3,$4)
         on conflict (id) do nothing`,
        [id, s.name, password_hash, s.avatar]
      ).catch(() => {});
    }

    const items = [
      {
        title: "iPhone 12 Pro 128GB (Factory Unlocked)",
        description: "Condition 9/10, full fresh, original box and charger included.",
        price: 58500,
        image_url: "https://images.unsplash.com/photo-1603898037225-1c9169a59f87?q=80&w=1200&auto=format&fit=crop",
        location: "Dhaka",
        category: "Mobiles",
      },
      {
        title: "Samsung 55\"\" 4K Smart TV (2022)",
        description: "Crystal UHD, warranty 6 months.",
        price: 45000,
        image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop",
        location: "Chattogram",
        category: "Electronics",
      },
      {
        title: "Honda CB Hornet 160R",
        description: "Single owner, tax token updated, mileage 35+.",
        price: 165000,
        image_url: "https://images.unsplash.com/photo-1620503374956-c9420e9107a9?q=80&w=1200&auto=format&fit=crop",
        location: "Sylhet",
        category: "Vehicles",
      },
      {
        title: "2 Bed Apartment for Rent - Bashundhara",
        description: "2 bed, 2 bath, 900 sqft, 3rd floor, lift + generator.",
        price: 28000,
        image_url: "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=1200&auto=format&fit=crop",
        location: "Dhaka",
        category: "Property",
      },
      {
        title: "Office Chair (Ergonomic)",
        description: "Mesh back, adjustable, almost new.",
        price: 5500,
        image_url: "https://images.unsplash.com/photo-1582582621959-48d89b8e3b3d?q=80&w=1200&auto=format&fit=crop",
        location: "Khulna",
        category: "Home & Living",
      },
      {
        title: "Ladies Saree (Silk) - Brand New",
        description: "Imported fabric, premium quality.",
        price: 3200,
        image_url: "https://images.unsplash.com/photo-1542060748-10c28b62716f?q=80&w=1200&auto=format&fit=crop",
        location: "Rajshahi",
        category: "Fashion",
      },
      {
        title: "Graphics Design Services",
        description: "Logo, flyer, social media kit. Fast delivery.",
        price: 1500,
        image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
        location: "Remote",
        category: "Services",
      },
      {
        title: "German Shepherd Puppy",
        description: "Pure breed, vaccinated.",
        price: 18000,
        image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200&auto=format&fit=crop",
        location: "Dhaka",
        category: "Pets",
      },
    ];

    for (const it of items) {
      const owner = sellerIds[Math.floor(Math.random() * sellerIds.length)];
      await query(
        `insert into market_listings (id, user_id, title, description, price, image_url, location, category)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), owner, it.title, it.description, it.price ?? null, it.image_url ?? null, it.location ?? null, it.category ?? null]
      ).catch(() => {});
    }

    res.json({ ok: true, created: items.length });
  } catch (e) {
    res.status(500).json({ error: "Seed failed" });
  }
};
