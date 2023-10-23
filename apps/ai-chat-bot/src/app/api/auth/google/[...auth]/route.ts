import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth, googleAuth } from "@/lib/auth/lucia";
import { OAuthRequestError } from "@lucia-auth/oauth";

export function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/api\/auth\/google/, "");

  switch (pathname) {
    case "/login": {
      return handleLogin();
    }
    case "/login/callback": {
      return handleCallback(request);
    }
    default:
      return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/api\/auth\/google/, "");

  if (pathname !== "/logout") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const authRequest = auth.handleRequest(request.method, { cookies, headers });

  // check if user is authenticated
  const session = await authRequest.validate();

  if (!session) {
    return new Response(null, {
      status: 401,
    });
  }

  // make sure to invalidate the current session!
  await auth.invalidateSession(session.sessionId);

  // delete session cookie
  authRequest.setSession(null);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login", // redirect to login page
    },
  });
}

async function handleLogin() {
  const [url, state] = await googleAuth.getAuthorizationUrl();

  // store state
  cookies().set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}

async function handleCallback(request: NextRequest) {
  const storedState = cookies().get("google_oauth_state")?.value;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // validate state
  if (!storedState || !state || storedState !== state || !code) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const { getExistingUser, googleUser, createUser } =
      await googleAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) {
        return existingUser;
      }

      const user = await createUser({
        attributes: {
          username: googleUser.name,
        },
      });

      return user;
    };

    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });

    const authRequest = auth.handleRequest(request.method, {
      cookies,
      headers,
    });

    authRequest.setSession(session);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/", // redirect to profile page
      },
    });
  } catch (e) {
    console.error(e);

    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }

    return new Response(null, {
      status: 500,
    });
  }
}
