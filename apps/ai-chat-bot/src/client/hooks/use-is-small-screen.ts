import { breakpoints } from "@/lib/common/constants";
import { useMediaQuery } from "./use-media-query";

export function useIsMobileScreen() {
  return useMediaQuery(`(max-width: ${breakpoints.md})`);
}
