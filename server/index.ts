import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { initDb } from "./db";
import { register, login, me } from "./routes/auth";
import { getFeed, createPost, reactPost, unreactPost } from "./routes/posts";
import dotenv from "dotenv";

dotenv.config();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Init DB (safe to run multiple times)
  initDb().catch((e) => console.error("DB init error", e));

  // Health
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, db: Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL), jwt: Boolean(process.env.JWT_SECRET) });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", me);

  // Posts
  app.get("/api/feed", getFeed);
  app.post("/api/posts", createPost);
  app.post("/api/posts/:id/react", reactPost);
  app.delete("/api/posts/:id/react", unreactPost);

  return app;
}
