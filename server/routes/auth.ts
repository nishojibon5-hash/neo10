import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db";
import { randomUUID } from "crypto";

function normalize(input?: string | null) {
  if (!input) return null;
  const v = String(input).trim();
  if (v.includes("@")) return v.toLowerCase();
  // phone: keep digits only
  const digits = v.replace(/\D+/g, "");
  return digits || null;
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  password: z.string().min(6),
  avatar_url: z.string().url().optional(),
});

export const register: RequestHandler = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: "Server missing JWT_SECRET" });

    const hash = await bcrypt.hash(data.password, 10);

    const email = normalize(data.email ?? null);
    const phone = normalize(data.phone ?? null);

    const { rows } = await query(
      `insert into users (name, email, phone, password_hash, avatar_url)
       values ($1,$2,$3,$4,$5)
       returning id, name, email, avatar_url`,
      [data.name.trim(), email, phone, hash, data.avatar_url ?? null],
    );

    const user = rows[0];
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: "User already exists" });
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Registration failed" });
  }
};

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  password: z.string().min(6),
});

export const login: RequestHandler = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: "Server missing JWT_SECRET" });
    const by = data.email ? "email" : "phone";
    const value = normalize(data.email ?? data.phone ?? "");

    const { rows } = await query(
      `select id, name, email, avatar_url, password_hash from users where ${by}=$1 limit 1`,
      [value],
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(data.password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    delete user.password_hash;
    res.json({ token, user });
  } catch (e: any) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
    res.status(500).json({ error: "Login failed" });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !JWT_SECRET) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const { rows } = await query(
      `select id, name, email, avatar_url from users where id=$1 limit 1`,
      [payload.sub],
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};
