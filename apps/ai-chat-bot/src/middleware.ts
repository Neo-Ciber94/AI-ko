import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth/lucia";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return redirectTo(req, "/chat");
  }

  const authRequest = auth.handleRequest(req as NextRequest);
  const session = await authRequest.validate();

  if (!session) {
    return redirectTo(req, "/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

function redirectTo(req: NextRequest, pathname: string) {
  if (req.nextUrl.pathname === pathname) {
    return NextResponse.next();
  }

  const nextUrl = req.nextUrl.clone();
  nextUrl.pathname = pathname;
  return NextResponse.redirect(nextUrl);
}
