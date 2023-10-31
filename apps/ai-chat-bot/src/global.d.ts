export declare global {
  export type NonNull<T> = T extends null | undefined ? never : T;
}
