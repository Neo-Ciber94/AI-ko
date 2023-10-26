import "highlight.js/styles/github-dark.min.css";
import { type ConversationMessage } from "@/lib/actions/conversation-messages";
import markdownIt from "markdown-it";
import hljs from "highlight.js";

// @ts-expect-error no types
import hljsZig from "highlightjs-zig";
hljs.registerLanguage("zig", hljsZig);

if (typeof window !== "undefined") {
  hljs.initHighlightingOnLoad();
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
            className="flex flex-row items-center gap-4 px-8"
          >
            {role === "system" && <Avatar role={role}>AI</Avatar>}
            <MessageContent message={message} />
            {role === "user" && <Avatar role={role}>Me</Avatar>}
          </div>
        );
      })}

      <div className="h-40 px-4">{/* Some extra padding */}</div>
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

function MessageContent({ message }: { message: Message }) {
  // we don't format user code
  if (message.role === "user") {
    return (
      <pre
        className={
          "chat-bubble-user w-full whitespace-pre-wrap break-all px-4 py-8"
        }
      >
        {message.content}
      </pre>
    );
  }

  return (
    <div
      className={
        "chat-bubble-system w-full whitespace-pre-wrap break-all px-4 py-8"
      }
      dangerouslySetInnerHTML={{
        __html: message.content,
      }}
    ></div>
  );
}

function Avatar({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <div
      className={`flex h-10 w-10 flex-shrink-0 flex-row items-center justify-center rounded-lg 
      border-2 bg-black text-white ${
        role === "user" ? "border-blue-500" : "border-red-500"
      }`}
    >
      {children}
    </div>
  );
}
