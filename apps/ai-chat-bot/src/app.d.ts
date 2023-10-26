/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/consistent-type-imports */
// app.d.ts

/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./lib/auth/lucia.js").Auth;
  type DatabaseUserAttributes = {
    username: string;
    is_authorized: number;
  };
  type DatabaseSessionAttributes = {};
}
