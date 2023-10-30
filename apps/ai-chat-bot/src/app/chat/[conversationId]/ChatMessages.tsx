import { type ConversationMessage } from "@/lib/actions/conversationMessages";
import { type AIModel } from "@/lib/actions/conversations";
import markdownIt from "markdown-it";
import hljs from "highlight.js";

// @ts-expect-error no types
import hljsZig from "highlightjs-zig";
import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { useHighLightJsThemes } from "@/components/providers/HighLightJsStylesProvider";
import InjectStyles from "@/components/InjectStyles";

// FIXME: Not entirely sure if this is safe
hljs.configure({
  ignoreUnescapedHTML: true,
});

hljs.registerLanguage("zig", hljsZig);

if (typeof window !== "undefined") {
  hljs.highlightAll();
}

type Message = Pick<ConversationMessage, "id" | "content" | "role">;
type Role = Message["role"];

type ChatMessagesProps = {
  messages: Message[];
  model: AIModel;
};

export default function ChatMessages({ model, ...rest }: ChatMessagesProps) {
  const messages = formatMessages(rest.messages);
  const [isDark] = isomorphicClient.isDark.useValue();
  const { darkThemeStyles, lightThemeStyles } = useHighLightJsThemes();

  return (
    <>
      <InjectStyles css={isDark ? darkThemeStyles : lightThemeStyles} />
      <div className="flex flex-col gap-4 pt-4">
        {messages.map((message) => {
          const role = message.role;

          return (
            <div
              key={message.id}
              className={
                "flex flex-row items-center gap-4 px-2 text-xs sm:px-4 sm:text-base"
              }
            >
              <div
                className={`w-full rounded-lg p-2 shadow ${
                  role === "user"
                    ? "bg-white text-black dark:bg-neutral-800 dark:text-white"
                    : "bg-gray-200 text-black dark:bg-black dark:text-white"
                }`}
              >
                <div className="flex w-full flex-row items-center justify-between">
                  {role === "assistant" ? (
                    <AIModelLabel model={model} />
                  ) : (
                    <div></div>
                  )}

                  {role === "assistant" && <Avatar role={role}>AI</Avatar>}
                  {role === "user" && <Avatar role={role}>Me</Avatar>}
                </div>
                <MessageContent message={message} />
              </div>
            </div>
          );
        })}

        <div className="h-40 px-4">{/* Some extra padding */}</div>
      </div>
    </>
  );
}

function MessageContent({ message }: { message: Message }) {
  // we don't format user code
  if (message.role === "user") {
    return (
      <pre
        suppressHydrationWarning
        className={"w-full whitespace-pre-wrap break-all p-2"}
      >
        {message.content}
      </pre>
    );
  }

  return (
    <pre
      suppressHydrationWarning
      className={"w-full break-before-all whitespace-pre-wrap p-2"}
      dangerouslySetInnerHTML={{
        __html: message.content,
      }}
    ></pre>
  );
}

function Avatar({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <div
      className={`flex h-8 w-10 flex-shrink-0 flex-row items-center justify-center rounded-lg border-2 bg-black 
      text-xs text-white sm:h-10 sm:w-16 sm:text-base ${
        role === "user" ? "border-blue-500" : "border-red-500"
      }`}
    >
      {children}
    </div>
  );
}

function AIModelLabel({ model }: { model: AIModel }) {
  return (
    <span
      title="AI Model"
      className={`flex h-6 cursor-pointer flex-row items-center justify-center 
  rounded-lg bg-gradient-to-t px-3 text-[10px] font-semibold shadow
  ${
    model === "gpt-3.5-turbo"
      ? "from-rose-900 to-rose-950 text-white"
      : "from-amber-300 to-amber-500 text-black"
  }`}
    >
      {model}
    </span>
  );
}

function formatMessages(messages: Message[]) {
  type MarkdownIt = ReturnType<typeof markdownIt>;

  const md: MarkdownIt = markdownIt({
    langPrefix: "```",
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(str, {
            language: lang,
            ignoreIllegals: true,
          }).value;

          return `<div class="my-4 flex flex-col">
                <div class="flex flex-row">
                    <span class="my-2 text-white bg-gray-800 px-2 py-2 rounded-lg text-xs w-fit whitespace-normal">
                      ${lang}
                    </span>
                </div>
                <pre class="hljs p-4 rounded-lg whitespace-pre-wrap break-all"><code>${highlighted}</code></pre>
            </div>`;
        } catch {
          //
        }
      }

      const html = md.utils.escapeHtml(str);
      return `<pre class="hljs p-4 rounded-lg my-4 whitespace-pre-wrap break-all">
                <code>${html}</code>
            </pre>`;
    },
  });

  // https://github.com/markdown-it/markdown-it/issues/269#issuecomment-506199293
  md.renderer.rules.fence = function (tokens, idx, options) {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : "";
    let langName = "";
    let highlighted;

    if (info) {
      langName = info.split(/\s+/g)[0];
    }

    if (options.highlight) {
      highlighted =
        options.highlight(token.content, langName, "") ||
        md.utils.escapeHtml(token.content);
    } else {
      highlighted = md.utils.escapeHtml(token.content);
    }

    return highlighted + "\n";
  };

  return messages.map((msg) => {
    const formattedContent =
      msg.role === "assistant" ? md.render(msg.content) : msg.content;

    return {
      ...msg,
      content: formattedContent,
    };
  });
}
