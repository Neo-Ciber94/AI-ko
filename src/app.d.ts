// app.d.ts

/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./lib/auth/lucia.js").Auth;
  type DatabaseUserAttributes = {
    username: string;
  };
  type DatabaseSessionAttributes = {};
}

export declare global {
  export type JsonValue =
    | number
    | string
    | boolean
    | null
    | undefined
    | JsonArray
    | JsonObject;

  export type JsonArray = Array<JsonValue>;

  export type JsonObject = {
    [key: string]: JsonValue;
  };
}
