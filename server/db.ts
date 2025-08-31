import { Pool } from "pg";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

export const pool = connectionString
  ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  : null;

export async function initDb() {
  if (!pool) return;
  await pool.query(`
    create extension if not exists pgcrypto;
    create extension if not exists "uuid-ossp";

    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      email text unique,
      phone text unique,
      password_hash text not null,
      avatar_url text,
      cover_url text,
      bio text,
      created_at timestamptz not null default now()
    );

    create table if not exists posts (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      content text,
      image_url text,
      privacy text default 'public',
      created_at timestamptz not null default now()
    );

    create table if not exists likes (
      user_id uuid not null references users(id) on delete cascade,
      post_id uuid not null references posts(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (user_id, post_id)
    );

    create table if not exists comments (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      post_id uuid not null references posts(id) on delete cascade,
      content text not null,
      created_at timestamptz not null default now()
    );

    create table if not exists friendships (
      user_id uuid not null references users(id) on delete cascade,
      friend_id uuid not null references users(id) on delete cascade,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      primary key (user_id, friend_id)
    );
  `);
}

export async function query(text: string, params?: any[]) {
  if (!pool) throw new Error("Database not configured. Set POSTGRES_URL env.");
  return pool.query(text, params);
}
