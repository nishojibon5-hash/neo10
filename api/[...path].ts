import serverless from "serverless-http";
import { createServer } from "../server";

export const config = { runtime: "nodejs20.x" } as const;

const app = createServer();
const handler = serverless(app);

export default async function vercelHandler(req: any, res: any) {
  return handler(req, res);
}
