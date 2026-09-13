"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

export function ChatMessage({
  message,
  copied,
  onCopy,
  onRegenerate,
  canRegenerate,
}: {
  message: ChatMessageType;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
}) {
  if (message.role === "user") {
    return (
      <article className="flex justify-end" aria-label="Your message">
        <div className="max-w-[88%] rounded-xl bg-foreground px-4 py-3 text-sm leading-6 text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group" aria-label="Mind Over Money AI response">
      <div className="flex gap-3">
        <div className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg border border-primary/20 bg-accent text-[10px] font-bold text-primary" aria-hidden="true">M</div>
        <div className="min-w-0 flex-1">
          {message.content ? (
            <div className="chat-markdown break-words text-sm leading-7 text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                h1: ({ children }) => <h2 className="mb-2 mt-5 text-lg font-semibold first:mt-0">{children}</h2>,
                h2: ({ children }) => <h3 className="mb-2 mt-5 text-base font-semibold first:mt-0">{children}</h3>,
                h3: ({ children }) => <h4 className="mb-1.5 mt-4 text-sm font-semibold first:mt-0">{children}</h4>,
                p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
                li: ({ children }) => <li className="pl-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-2">{children}</a>,
                blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-primary/40 pl-3 text-muted-foreground">{children}</blockquote>,
                table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-xs">{children}</table></div>,
                th: ({ children }) => <th className="border border-border bg-surface-muted px-2.5 py-2 text-left font-semibold">{children}</th>,
                td: ({ children }) => <td className="border border-border px-2.5 py-2 align-top">{children}</td>,
                pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-lg bg-foreground p-3 text-xs leading-5 text-white">{children}</pre>,
                code: ({ className, children }) => className
                  ? <code className={className}>{children}</code>
                  : <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
              }}>{message.content}</ReactMarkdown>
              {message.status === "streaming" && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" aria-label="Response is streaming" />}
            </div>
          ) : message.status === "streaming" ? (
            <div className="flex items-center gap-1.5 py-2" aria-label="Gemini is preparing a response">
              {[0, 1, 2].map((dot) => <span key={dot} className="size-1.5 animate-pulse rounded-full bg-primary/60" style={{ animationDelay: `${dot * 120}ms` }} />)}
            </div>
          ) : null}

          {message.status === "error" && !message.content && <p className="text-sm text-danger">The response was interrupted. You can retry it.</p>}

          {message.status !== "streaming" && message.content && (
            <div className="mt-2 flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <Button type="button" variant="ghost" size="xs" onClick={onCopy} aria-label="Copy response">
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy"}
              </Button>
              {canRegenerate && <Button type="button" variant="ghost" size="xs" onClick={onRegenerate}><RefreshCw aria-hidden="true" />Regenerate</Button>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
