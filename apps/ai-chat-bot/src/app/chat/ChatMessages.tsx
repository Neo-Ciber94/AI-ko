import "highlight.js/styles/github-dark.min.css";
import { type ConversationMessage } from "@/lib/actions/conversationMessages";
import markdownIt from "markdown-it";
import hljs from "highlight.js";

hljs.configure({
  ignoreUnescapedHTML: true,
});

// @ts-expect-error no types
import hljsZig from "highlightjs-zig";
hljs.registerLanguage("zig", hljsZig);

if (typeof window !== "undefined") {
  hljs.highlightAll();

  // FIXME: Not entirely sure if this is safe
}

type Message = Pick<ConversationMessage, "id" | "content" | "role">;
type Role = Message["role"];

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages(props: ChatMessagesProps) {
  const messages = formatMessages(props.messages);

  return (
    <div className="flex flex-col gap-4 pt-4">
      {messages.map((message) => {
        const role = message.role;

        return (
          <div
            key={message.id}
            className={
              "flex flex-row items-center gap-4 px-2 text-xs sm:px-8 sm:text-base"
            }
          >
            <div
              className={`w-full rounded-lg p-2 ${
                role === "user"
                  ? "bg-white text-black dark:bg-neutral-800 dark:text-white"
                  : "bg-black text-white"
              }`}
            >
              <div className="flex w-full flex-row justify-end">
                {role === "system" && <Avatar role={role}>AI</Avatar>}
                {role === "user" && <Avatar role={role}>Me</Avatar>}
              </div>
              <MessageContent message={message} />
            </div>
          </div>
        );
      })}

      <div className="h-40 px-4">{/* Some extra padding */}</div>
    </div>
  );
}

function MessageContent({ message }: { message: Message }) {
  // we don't format user code
  if (message.role === "user") {
    return (
      <pre
        suppressHydrationWarning
        className={"w-full whitespace-pre-wrap break-all p-2 sm:p-4"}
      >
        {message.content}
      </pre>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className={"w-full px-4 py-4 sm:py-8"}
      dangerouslySetInnerHTML={{
        __html: message.content,
      }}
    ></div>
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
                    <span class="my-2 text-white bg-gray-800 px-2 py-2 rounded-lg text-xs w-fit">
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
      msg.role === "system" ? md.render(msg.content) : msg.content;

    return {
      ...msg,
      content: formattedContent,
    };
  });
}
