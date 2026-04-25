import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ANTHROPIC_API_KEY, ANTHROPIC_MODEL } from "@/lib/config";
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
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not configured. Add it to .env.local to enable the chatbot.",
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

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  // Build Anthropic messages from history (skip system; that goes in `system`)
  const fullHistory = getMessages(session.id);
  const messages: Anthropic.MessageParam[] = fullHistory
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  let recommendedIds: string[] = [];
  let escalateInfo: { whatsapp_url: string; reason: string } | undefined;
  let assistantText = "";

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: SAREE_SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: CHAT_TOOLS as any,
      messages,
    });

    // Collect text + tool_use blocks
    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (textBlocks.length) {
      assistantText = textBlocks.map((b) => b.text).join("\n").trim();
    }

    if (response.stop_reason === "tool_use" && toolUses.length > 0) {
      // Push assistant turn (with tool_use blocks)
      messages.push({ role: "assistant", content: response.content });

      // Run tools and build a single user turn with tool_results
      const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const tr = await runTool(
          tu.name,
          (tu.input as Record<string, unknown>) || {},
          session.id,
        );
        if (tr.product_ids) recommendedIds.push(...tr.product_ids);
        if (tr.escalate) escalateInfo = tr.escalate;
        toolResultBlocks.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: JSON.stringify(tr.result),
        });
      }
      messages.push({ role: "user", content: toolResultBlocks });
      continue;
    }

    // Final answer reached
    break;
  }

  if (!assistantText) {
    assistantText =
      "Sorry — I had trouble formulating a response. Could you rephrase that, or would you like to talk to a human?";
  }

  // De-dup recommendations
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
