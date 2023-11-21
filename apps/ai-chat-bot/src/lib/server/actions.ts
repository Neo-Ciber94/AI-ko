import { isNotFoundError } from "next/dist/client/components/not-found";
import { isRedirectError } from "next/dist/client/components/redirect";
import { headers } from "next/headers";
import { type ZodType } from "zod";

type ServerActionProviderOptions<TContext> = {
  /**
   * A function to execute before running each action.
   * @returns Returns a context to use in the actions.
   */
  beforeExecute?: () => Promise<TContext> | TContext;
};

/**
 * Represents an error that ocurred while executing a server action.
 */
type ServerError = {
  /**
   * Whether if is a validation error.
   */
  isValidationError: boolean;

  /**
   * The error message.
   */
  message?: string;
};

/**
 * Params to pass to a server action.
 */
type ServerActionParams<TResult, TContext, TInput> = {
  /**
   * The input validator.
   */
  input?: ZodType<TInput> | undefined;

  /**
   * The action to execute.
   * @param params The params of the action with the context and input.
   */
  action: (params: { input: TInput; ctx: TContext }) => Promise<TResult>;
};

type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServerError };

/**
 * Create a function to create server actions.
 * @param opts Options for the server action provider.
 * @returns Returns a function to create server actions.
 */
export function createServerActionProvider<TContext = void>(
  opts?: ServerActionProviderOptions<TContext>,
) {
  return <TResult, TInput = void>(
    params: ServerActionParams<TResult, TContext, TInput>,
  ) => {
    type TArgs = undefined extends TInput ? [input?: TInput] : [input: TInput];
    const { beforeExecute } = opts || {};

    async function serverActionFunction(
      ...args: TArgs
    ): Promise<ServerActionResult<TResult>> {
      let input: TInput | undefined = undefined;
      let ctx: TContext | undefined = undefined;
      const { input: validator, action } = params;

      try {
        if (beforeExecute) {
          ctx = await Promise.resolve(beforeExecute());
        }

        if (validator) {
          const validationResult = validator.safeParse(args[0]);

          if (!validationResult.success) {
            const message = validationResult.error.issues
              .map((x) => x.message)
              .join("\n");

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

        const result = await action({
          input: input as TInput,
          ctx: ctx as TContext,
        });

        return { data: result, success: true };
      } catch (err) {
        if (isRedirectError(err) || isNotFoundError(err)) {
          console.log({ err });
          throw err;
        }

        const message = err instanceof Error ? err.message : undefined;
        return {
          success: false,
          error: { isValidationError: false, message },
        };
      }
    }

    /**
     * A function to use in a `<form>` as action.
     * @param formData The input form data.
     */
    serverActionFunction.formAction = async function (formData: FormData) {
      const input = Object.fromEntries(formData);
      const result = await serverActionFunction(input as any);

      console.log(input);
      if (!result.success) {
        const { isValidationError, message } = result.error;
        headers().set("Server-Action-Error-Message", message);
        headers().set("Server-Action-Validator-Error", isValidationError);
      }
    };

    return serverActionFunction;
  };
}
