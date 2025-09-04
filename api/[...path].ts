import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server";

// Create the Express app once per runtime
const app = createServer();

// Vercel will route all /api/* requests here because of the catch-all filename
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Let Express handle the request
  // @ts-ignore - Express types are compatible with Vercel's req/res at runtime
  return app(req as any, res as any);
}
