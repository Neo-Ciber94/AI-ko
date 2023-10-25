import { type NextRequest } from "next/server";

export const runtime = "edge";

export function POST(req: NextRequest) {
  return new Response(req.url);
}
