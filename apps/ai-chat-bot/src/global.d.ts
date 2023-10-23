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
