// app.d.ts

/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./lib/auth/lucia.js").Auth;
  type DatabaseUserAttributes = {
    username: string;
  };
  type DatabaseSessionAttributes = {};
}
