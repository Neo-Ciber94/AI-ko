import { isRedirectError } from "next/dist/client/components/redirect";
import { headers } from "next/headers";
import { type ZodType } from "zod";

type ServerActionProviderOptions<TContext> = {
  beforeExecute?: () => Promise<TContext> | TContext;
};

type ServerError = {
  isValidationError: boolean;
  message?: string;
};

type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServerError };

export function createServerActionProvider<TContext = void>(
  opts?: ServerActionProviderOptions<TContext>,
) {
  return <TResult, TInput = void>(
    validator: ZodType<TInput> | undefined,
    serverAction: (actionInput: {
      input: TInput;
      ctx: TContext;
    }) => Promise<TResult>,
  ) => {
    type TArgs = undefined extends TInput ? [input?: TInput] : [input: TInput];
    const { beforeExecute } = opts || {};

    async function serverActionFunction(
      ...args: TArgs
    ): Promise<ServerActionResult<TResult>> {
      let input: TInput | undefined = undefined;
      let ctx: TContext | undefined = undefined;

      if (beforeExecute) {
        try {
          ctx = await Promise.resolve(beforeExecute());
        } catch (err) {
          if (isRedirectError(err)) {
            throw err;
          }

          const message = err instanceof Error ? err.message : undefined;
          return {
            success: false,
            error: { isValidationError: false, message },
          };
        }
      }

      if (validator) {
        const validationResult = validator.safeParse(args[0]);

        if (!validationResult.success) {
          const message = validationResult.error.issues.join("\n");

          return {
            success: false,
            error: {
              isValidationError: true,
              message,
            },
          };
        }

        input = validationResult.data;
      }

      try {
        const result = await serverAction({
          input: input as TInput,
          ctx: ctx as TContext,
        });

        return { data: result, success: true };
      } catch (err) {
        if (isRedirectError(err)) {
          throw err;
        }

        const message = err instanceof Error ? err.message : undefined;
        return { success: false, error: { isValidationError: false, message } };
      }
    }

    serverActionFunction.formAction = async function (formData: FormData) {
      const input = Object.fromEntries(formData);
      const result = await serverActionFunction(input as any);

      if (!result.success) {
        const { isValidationError, message } = result.error;
        headers().set("Server-Action-Error-Message", message);
        headers().set("Server-Action-Validator-Error", isValidationError);
      }
    };

    return serverActionFunction;
  };
}
