import { useEffect, useId, useRef, useState } from "react";
import { MessageCircle, X, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCms } from "@/lib/cms-context";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17V22l3.05-1.67c.94.26 1.94.4 2.97.4 5.64 0 10.16-4.13 10.16-9.03S17.64 2 12 2zm1.01 12.16-2.61-2.78-5.09 2.78L10.66 8.5l2.66 2.78 5.04-2.78-5.35 5.66z" />
    </svg>
  );
}

export function ChatWidget() {
  const { settings } = useCms();
  const chat = settings.chat;
  const whatsappNumber = settings.links.whatsappNumber.replace(/\D/g, "") || "8801000000000";
  const messengerPage = settings.links.messengerPage || "nexasoft";
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(chat.defaultMessage);
  const panelId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const text = message.trim() || chat.fallbackMessage;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  const messengerUrl = `https://m.me/${messengerPage}?text=${encodeURIComponent(text)}`;

  function logChatIntent(channel: "whatsapp" | "messenger" | "quick-reply" | "open") {
    void fetch("/api/chat-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        message: text,
        page: typeof window !== "undefined" ? window.location.pathname : "/",
      }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <div className="fixed bottom-5 left-3 z-[56] flex flex-col items-start gap-3 sm:bottom-6 sm:left-5">
      {/* Panel */}
      <div
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-label="Live chat"
        aria-hidden={!open}
        className={cn(
          "w-[min(22.5rem,calc(100vw-1.5rem))] origin-bottom-left overflow-hidden rounded-2xl border border-white/12 bg-background/95 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-all duration-300",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
      >
        <div className="relative overflow-hidden bg-gradient-brand px-4 py-4 text-primary-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{chat.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-primary-foreground/85">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/80" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </span>
                {chat.statusLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-2xl rounded-tl-md border border-border bg-surface-2/60 px-3.5 py-3 text-sm leading-relaxed text-foreground/85">
            {chat.intro}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {chat.quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => setMessage(reply)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                  message === reply
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border bg-surface-2/40 text-foreground/70 hover:border-accent/30 hover:text-foreground",
                )}
              >
                {reply}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-foreground/70">Your message</span>
            <textarea
              ref={inputRef}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-input bg-surface-2/50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-ring/40"
              placeholder="Type your question…"
            />
          </label>

          <div className="grid gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => logChatIntent("whatsapp")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Continue on WhatsApp
              <Send className="h-3.5 w-3.5 opacity-80" />
            </a>
            <a
              href={messengerUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => logChatIntent("messenger")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0084FF] px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <MessengerIcon className="h-4 w-4" />
              Continue on Messenger
              <Send className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Opens chat with your message pre-filled
          </p>
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((v) => {
            if (!v) logChatIntent("open");
            return !v;
          });
        }}
        className={cn(
          "group relative inline-flex items-center gap-2.5 rounded-full px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-12px_rgba(56,189,248,0.65)] transition-all duration-300",
          open
            ? "bg-surface-2 text-foreground shadow-lg ring-1 ring-white/10"
            : "bg-gradient-brand hover:-translate-y-0.5 hover:brightness-110",
        )}
      >
        {!open ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-accent/30"
            style={{ animationDuration: "2.4s" }}
          />
        ) : null}
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-white/20">
          {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        </span>
        <span className="relative pr-0.5">{open ? "Close" : "Chat with us"}</span>
      </button>
    </div>
  );
}
