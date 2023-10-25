import { libsql } from "@lucia-auth/adapter-sqlite";
import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { tursoDbClient } from "../database";
import { google } from "@lucia-auth/oauth/providers";
import { env } from "../env";

export const auth = lucia({
  adapter: libsql(tursoDbClient, {
    user: "user",
    session: "user_session",
    key: "user_key",
  }),
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),

  sessionCookie: {
    expires: false,
  },

  getUserAttributes(databaseUser) {
    return {
      username: databaseUser.username,
    };
  },
});

export const googleAuth = google(auth, {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: "http://localhost:3000/api/auth/google/login/callback",
});

export type Auth = typeof auth;
