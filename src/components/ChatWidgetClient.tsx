"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";
import { STORE_NAME } from "@/lib/config";

interface ChatProduct {
  id: string;
  slug: string;
  name: string;
  price_inr: number;
  fabric: string;
  image_url: string;
}

interface UiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: ChatProduct[];
  escalate?: { whatsapp_url: string; reason: string };
}

const SESSION_KEY = "saree-chat-session";
const HISTORY_KEY = "saree-chat-history";
const SUGGESTIONS = [
  "I need a saree for my sister's wedding",
  "What's the difference between Banarasi and Kanjivaram?",
  "Show me cotton sarees under ₹5000",
  "Help me track my order",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const addToCart = useCart((s) => s.add);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY) || undefined;
    setSessionId(savedSession);
    const history = localStorage.getItem(HISTORY_KEY);
    if (history) {
      try {
        setMessages(JSON.parse(history));
      } catch {
        /* ignore */
      }
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: `Namaste! I'm the ${STORE_NAME} Saree Assistant. Tell me what you're looking for — an occasion, a favorite color, a budget — and I'll help you find the perfect saree.`,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setError(null);
    setSending(true);
    const userMsg: UiMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      text: message,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem(SESSION_KEY, data.session_id);
      }
      const assistantMsg: UiMessage = {
        id: data.message_id || `a-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        products: data.products,
        escalate: data.escalate,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  function clearChat() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(HISTORY_KEY);
    setSessionId(undefined);
    setMessages([
      {
        id: "welcome-2",
        role: "assistant",
        text: `Fresh start! What can I help you find?`,
      },
    ]);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[var(--brand)] text-white shadow-xl flex items-center justify-center hover:bg-[var(--brand-dark)] transition ${
          open ? "" : "chat-fab-pulse"
        }`}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <span className="text-xl">×</span>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-6 z-40 w-full sm:w-[400px] h-[80vh] sm:h-[600px] sm:rounded-2xl bg-white shadow-2xl flex flex-col border border-black/10 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-[var(--brand)] text-white flex items-center justify-between">
            <div>
              <p className="font-semibold leading-tight">Saree Assistant</p>
              <p className="text-[11px] opacity-80 leading-tight">
                AI · usually replies in seconds
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                title="Start over"
                className="text-xs opacity-80 hover:opacity-100"
              >
                Reset
              </button>
              <button onClick={() => setOpen(false)} className="text-xl px-1">
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--background)]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--brand)] text-white rounded-br-sm"
                      : "bg-[var(--muted)] text-black rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {m.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex gap-2 bg-white rounded-xl border border-black/10 p-2"
                        >
                          <Link
                            href={`/products/${p.slug}`}
                            className="relative w-14 h-18 rounded overflow-hidden bg-[var(--muted)] shrink-0"
                            target="_blank"
                          >
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              className="block text-xs font-medium text-black truncate hover:text-[var(--brand)]"
                            >
                              {p.name}
                            </Link>
                            <p className="text-[10px] text-black/55">{p.fabric}</p>
                            <p className="text-xs font-semibold text-[var(--brand)] mt-0.5">
                              {formatPrice(p.price_inr)}
                            </p>
                            <button
                              onClick={() =>
                                addToCart(
                                  {
                                    id: p.id,
                                    slug: p.slug,
                                    name: p.name,
                                    price_inr: p.price_inr,
                                    fabric: p.fabric,
                                    image_url: p.image_url,
                                    description: "",
                                    color: "",
                                    category: "",
                                    occasion_tags: [],
                                    stock_quantity: 99,
                                    status: "active",
                                    created_at: new Date().toISOString(),
                                  },
                                  1,
                                )
                              }
                              className="text-[10px] text-[var(--brand)] hover:underline mt-1"
                            >
                              + Add to cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.escalate && (
                    <a
                      href={m.escalate.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-full"
                    >
                      Continue on WhatsApp →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-[var(--muted)] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm">
                  <span className="inline-block animate-pulse">...</span>
                </div>
              </div>
            )}
            {error && (
              <p className="text-xs text-red-600 text-center">{error}</p>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-black/10 hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="border-t border-black/10 p-3 flex gap-2 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 px-3 py-2 rounded-full border border-black/15 text-sm focus:border-[var(--brand)] focus:outline-none"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-[var(--brand)] text-white rounded-full px-4 text-sm disabled:opacity-50"
            >
              Send
            </button>
          </form>
          <p className="px-3 pb-2 text-[10px] text-black/45 text-center">
            Powered by AI · Ask for human help anytime
          </p>
        </div>
      )}
    </>
  );
}
