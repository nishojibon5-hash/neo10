import { Pool } from "pg";

const raw = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
const connectionString = raw ? raw.replace(/([?&])channel_binding=[^&]+&?/i, "$1").replace(/[?&]$/, "") : "";

export const pool = connectionString
  ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  : null;

export async function initDb() {
  if (!pool) return;
  const statements = [
    `create table if not exists users (
      id uuid primary key,
      name text not null,
      username text unique,
      email text unique,
      phone text unique,
      password_hash text not null,
      avatar_url text,
      cover_url text,
      bio text,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists posts (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      content text,
      content_mode text not null default 'text',
      image_url text,
      video_url text,
      type text not null default 'post',
      monetized boolean not null default false,
      privacy text default 'public',
      created_at timestamptz not null default now()
    )`,
    `create table if not exists likes (
      user_id uuid not null references users(id) on delete cascade,
      post_id uuid not null references posts(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (user_id, post_id)
    )`,
    `create table if not exists reactions (
      user_id uuid not null references users(id) on delete cascade,
      post_id uuid not null references posts(id) on delete cascade,
      type text not null check (type in ('😆','🥲','🫦','🥴','😡','♥️','🤔','😮')),
      created_at timestamptz not null default now(),
      primary key (user_id, post_id)
    )`,
    `create table if not exists comments (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      post_id uuid not null references posts(id) on delete cascade,
      content text not null,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists friendships (
      user_id uuid not null references users(id) on delete cascade,
      friend_id uuid not null references users(id) on delete cascade,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      primary key (user_id, friend_id)
    )`,
    `create table if not exists assets (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      filename text,
      mime_type text not null,
      bytes bytea not null,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists stories (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      image_url text,
      video_url text,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists ads (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      title text not null,
      media_url text,
      media_type text check (media_type in ('image','video')),
      destination_url text,
      locations text,
      audience text,
      budget numeric,
      start_at timestamptz,
      end_at timestamptz,
      status text not null default 'pending',
      trial_until timestamptz,
      payment_method text,
      transaction_id text,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists ad_impressions (
      id uuid primary key,
      ad_id uuid not null references ads(id) on delete cascade,
      placement text,
      created_at timestamptz not null default now()
    )`,
  ];
  for (const sql of statements) {
    try { await pool.query(sql); } catch (e) { console.error("DB init step failed", e); }
  }
  // Migrations for existing databases
  const alters = [
    "alter table if exists users add column if not exists username text unique",
    "alter table if exists posts add column if not exists content_mode text not null default 'text'",
    "alter table if exists posts add column if not exists video_url text",
    "alter table if exists posts add column if not exists type text not null default 'post'",
    "alter table if exists posts add column if not exists monetized boolean not null default false",
  ];
  for (const sql of alters) {
    try { await pool.query(sql); } catch (e) { console.error("DB alter step failed", e); }
  }
}

export async function query(text: string, params?: any[]) {
  if (!pool) throw new Error("Database not configured. Set POSTGRES_URL env.");
  return pool.query(text, params);
}
