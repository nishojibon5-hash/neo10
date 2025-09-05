import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { initDb } from "./db";
import { register, login, me } from "./routes/auth";
import { getFeed, createPost, reactPost, unreactPost, listComments, addComment, deletePost } from "./routes/posts";
import { getUser, getUserPosts, updateMe, follow, accept, requests as friendRequests, suggestions as friendSuggestions, friendsList, unfriend } from "./routes/users";
import { uploadBase64, getAsset } from "./routes/assets";
import { listStories, createStory } from "./routes/stories";
import { createAd, listMyAds, getActiveAd, addImpression, patchAd } from "./routes/ads";
import { listListings, createListing, deleteListing, listCategories, getListing, seedDemo } from "./routes/market";
import { ensureConversation, listConversations, listMessages, sendMessage } from "./routes/messages";
import { listNotifications } from "./routes/notifications";
import { resolveUrl } from "./routes/resolve";
import { mediaProxy } from "./routes/proxy";
import dotenv from "dotenv";

dotenv.config();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Init DB (safe to run multiple times)
  initDb().catch((e) => console.error("DB init error", e));

  // Health
  app.get("/api/health", async (_req, res) => {
    let dbOk = false;
    try { const { pool } = await import('./db'); dbOk = !!pool; if (pool) { await pool.query('select 1'); } } catch {}
    res.json({ ok: true, db: dbOk, jwt: Boolean(process.env.JWT_SECRET) });
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
  app.delete("/api/posts/:id", deletePost);
  app.get("/api/posts/:id/comments", listComments);
  app.post("/api/posts/:id/comments", addComment);

  // Users
  app.get("/api/users/:id", getUser);
  app.get("/api/users/:id/posts", getUserPosts);
  app.patch("/api/users/me", updateMe);
  app.post("/api/users/:id/follow", follow);
  app.post("/api/users/:id/accept", accept);
  app.get("/api/friends/requests", friendRequests);
  app.get("/api/friends/suggestions", friendSuggestions);
  app.get("/api/friends/list", friendsList);
  app.delete("/api/friends/:id", unfriend);

  // Assets
  app.post("/api/assets/base64", uploadBase64);
  app.get("/api/assets/:id", getAsset);

  // Stories
  app.get("/api/stories", listStories);
  app.post("/api/stories", createStory);

  // Ads
  app.post("/api/ads", createAd);
  app.get("/api/ads/mine", listMyAds);
  app.get("/api/ads/active", getActiveAd);
  app.post("/api/ads/:id/impression", addImpression);
  app.patch("/api/ads/:id", patchAd);

  // Marketplace
  app.get("/api/market/listings", listListings);
  app.get("/api/market/listings/:id", getListing);
  app.post("/api/market/listings", createListing);
  app.delete("/api/market/listings/:id", deleteListing);
  app.get("/api/market/categories", listCategories);
  app.post("/api/market/seed-demo", seedDemo as any);

  // Messaging
  app.post("/api/messages/ensure/:userId", ensureConversation);
  app.get("/api/messages/conversations", listConversations);
  app.get("/api/messages/:id", listMessages);
  app.post("/api/messages/:id", sendMessage);

  // Notifications
  app.get("/api/notifications", listNotifications);

  // Utils
  app.get("/api/resolve", resolveUrl);
  app.get("/api/proxy", mediaProxy);

  return app;
}
