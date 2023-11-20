import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth/lucia";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authRequest = auth.handleRequest(req as NextRequest);
  const session = await authRequest.validate();

  if (pathname.startsWith("/api") && !session?.user.isAuthorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!session) {
    if (pathname === "/") {
      return NextResponse.next();
    }

    return redirectTo(req, "/login");
  }

  if (session && pathname === "/login") {
    return redirectTo(req, "/chat");
  }

  // Is user is not unauthorized redirect to `/unauthorized`
  if (pathname !== "/unauthorized" && !session.user.isAuthorized) {
    return redirectTo(req, "/unauthorized");
  }

  // If is authorized redirect from `/unauthorized`
  if (pathname === "/unauthorized" && session.user.isAuthorized) {
    return redirectTo(req, "/chat");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\..*).*)",
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
