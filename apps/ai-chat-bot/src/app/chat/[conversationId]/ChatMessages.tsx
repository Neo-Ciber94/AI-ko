import { type ConversationMessageWithContents } from "@/lib/actions/conversationMessages";

import markdownIt from "markdown-it";
import hljs from "highlight.js";

// @ts-expect-error no types
import hljsZig from "highlightjs-zig";
import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { useHighLightJsThemes } from "@/components/providers/HighLightJsStylesProvider";
import InjectStyles from "@/components/InjectStyles";
import type { AIModel } from "@/lib/database/types";
import ChatMessageItem from "./ChatMessageItem";
import { ChatError } from "@/client/hooks/use-chat";

// FIXME: Not entirely sure if this is safe
hljs.configure({
  ignoreUnescapedHTML: true,
});

hljs.registerLanguage("zig", hljsZig);

if (typeof window !== "undefined") {
  hljs.highlightAll();
}

export type Message = Pick<
  ConversationMessageWithContents,
  "id" | "role" | "contents"
>;

type ChatMessagesProps = {
  messages: Message[];
  model: AIModel;
  isLoading?: boolean;
  canRegenerate?: boolean;
  error?: ChatError
};

export default function ChatMessages({
  model,
  isLoading,
  canRegenerate,
  error,
  ...rest
}: ChatMessagesProps) {
  const messages = formatMessages(rest.messages);
  const [isDark] = isomorphicClient.isDark.useValue();
  const { darkThemeStyles, lightThemeStyles } = useHighLightJsThemes();

  return (
    <>
      <InjectStyles css={isDark ? darkThemeStyles : lightThemeStyles} />
      <div className="flex flex-col gap-4 pt-4">
        {messages.map((message, idx) => {
          const isLastMessage = idx === messages.length - 1;
          return (
            <ChatMessageItem
              key={message.id}
              model={model}
              message={message}
              canRegenerate={canRegenerate && isLastMessage}
            />
          );
        })}

        {isLoading && (
          <ChatMessageItem
            isLoading
            error={error}
            model={model}
            message={{
              id: crypto.randomUUID(),
              role: "assistant",
              contents: [],
            }}
          />
        )}

        <div className="h-40 px-4">{/* Some extra padding */}</div>
      </div>
    </>
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

          return `<div class="my-2 flex flex-col">
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
    const formattedMessageContent =
      msg.role === "user"
        ? msg.contents
        : msg.contents.map((x) => {
            if (x.type === "image") {
              return x;
            }

            return { ...x, text: md.render(x.text) };
          });

    return {
      ...msg,
      contents: formattedMessageContent,
    } satisfies Message;
  });
}
