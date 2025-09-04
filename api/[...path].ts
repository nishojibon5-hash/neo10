import { createServer } from "../server";

let app: any;

export default async function handler(req: any, res: any) {
  try {
    if (!app) app = createServer();
    return app(req, res);
  } catch (e: any) {
    console.error("API handler init error", e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "FUNCTION_INVOCATION_FAILED",
        message: String(e?.message || e),
      }),
    );
  }
}
