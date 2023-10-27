/**
 * A result type.
 */
export type Result<T, TError> = T extends undefined
  ? { type: "success"; value?: T } | { type: "error"; error: TError }
  : { type: "success"; value: T } | { type: "error"; error: TError };
