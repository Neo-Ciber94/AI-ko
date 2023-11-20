import { getSession } from "../auth/utils";
import { createServerActionProvider } from "../server/actions";
import { ratelimit } from "../server/rateLimiter";

export const action = createServerActionProvider({
  async beforeExecute() {
    const session = await getSession();

    if (!session) {
      throw new Error("Session not found");
    }

    const rateLimiterResult = await ratelimit.limit(session.user.userId);

    if (!rateLimiterResult.success) {
      throw new Error("Too many requests");
    }
  },
});
