import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { OPENAI_API_KEY, OPENAI_MODEL } from "@/lib/config";
import { CHAT_TOOLS, SAREE_SYSTEM_PROMPT } from "@/lib/chat-prompt";
import { runTool } from "@/lib/chat-tools";
import {
  appendMessage,
  getMessages,
  getOrCreateSession,
  getProductsByIds,
} from "@/lib/store";
import type { ChatMessage, Product } from "@/types";

const Schema = z.object({
  session_id: z.string().optional(),
  guest_id: z.string().optional(),
  message: z.string().min(1).max(4000),
});

const MAX_MESSAGES_PER_SESSION = 30;
const MAX_TOOL_HOPS = 5;

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not configured. Add it to .env.local to enable the chatbot.",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const session = getOrCreateSession(parsed.data.session_id, parsed.data.guest_id);
  const history = getMessages(session.id);

  if (history.length >= MAX_MESSAGES_PER_SESSION) {
    return NextResponse.json({
      session_id: session.id,
      reply:
        "We've chatted quite a bit! For continued help, let me hand you over to a human team member on WhatsApp.",
      escalate: true,
    });
  }

  appendMessage(session.id, { role: "user", content: parsed.data.message });

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Build OpenAI messages: system prompt, then user/assistant turns from history.
  const fullHistory = getMessages(session.id);
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SAREE_SYSTEM_PROMPT },
    ...fullHistory
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map(
        (m) =>
          ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }) as OpenAI.Chat.Completions.ChatCompletionMessageParam,
      ),
  ];

  let recommendedIds: string[] = [];
  let escalateInfo: { whatsapp_url: string; reason: string } | undefined;
  let assistantText = "";

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      tools: CHAT_TOOLS,
      max_tokens: 1024,
    });

    const choice = response.choices[0];
    const msg = choice.message;

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      // Push the assistant turn that requested the tool calls
      messages.push(msg);

      // Execute each tool call, append a `tool` role message per call
      for (const tc of msg.tool_calls) {
        if (tc.type !== "function") continue;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments || "{}");
        } catch {
          /* leave empty if model returned malformed JSON */
        }
        const tr = await runTool(tc.function.name, args, session.id);
        if (tr.product_ids) recommendedIds.push(...tr.product_ids);
        if (tr.escalate) escalateInfo = tr.escalate;
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(tr.result),
        });
      }
      continue;
    }

    // No tool calls — final response reached
    assistantText = (msg.content || "").trim();
    break;
  }

  if (!assistantText) {
    assistantText =
      "Sorry — I had trouble formulating a response. Could you rephrase that, or would you like to talk to a human?";
  }

  recommendedIds = [...new Set(recommendedIds)];
  const recommendedProducts: Product[] = recommendedIds.length
    ? getProductsByIds(recommendedIds)
    : [];

  const stored: ChatMessage = appendMessage(session.id, {
    role: "assistant",
    content: assistantText,
    product_ids_recommended: recommendedIds,
    metadata: escalateInfo ? { escalate: escalateInfo } : undefined,
  });

  return NextResponse.json({
    session_id: session.id,
    message_id: stored.id,
    reply: assistantText,
    products: recommendedProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price_inr: p.price_inr,
      fabric: p.fabric,
      image_url: p.image_url,
    })),
    escalate: escalateInfo,
  });
}
