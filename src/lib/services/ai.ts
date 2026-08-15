import { defaultInsightPacket, buildVariants, InsightPacket, PostVariant } from "../content";
import { env } from "../env";

export type AIResult = { packet: InsightPacket; variants: PostVariant[]; fallbackUsed: boolean };

async function callProvider(prompt: string) {
  if (!env.AI_BASE_URL || !env.AI_API_KEY || !env.AI_MODEL) throw new Error("AI_NOT_CONFIGURED");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(`${env.AI_BASE_URL.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.AI_API_KEY}` }, body: JSON.stringify({ model: env.AI_MODEL, temperature: 0.3, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Return valid JSON only. Never invent facts. Use only the supplied source evidence." }, { role: "user", content: prompt }] }) });
    if (!response.ok) throw new Error("AI_PROVIDER_FAILED");
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI_EMPTY_RESPONSE");
    return JSON.parse(content) as { packet: InsightPacket; variants: PostVariant[] };
  } finally { clearTimeout(timeout); }
}

export async function generateContent(story: { title: string; canonicalUrl: string; publisher: string; summary?: string | null }, styleGuide?: string): Promise<AIResult> {
  const fallback = () => { const packet = defaultInsightPacket(story); return { packet, variants: buildVariants(packet), fallbackUsed: true }; };
  try {
    const generated = await callProvider(`Create an insight packet and exactly three LinkedIn post variants for this source-backed story. Style guide: ${styleGuide ?? "crisp executive voice"}. Story: ${JSON.stringify(story)}. Output {"packet": {...}, "variants": [{"angle": string, "body": string, "hashtags": string[]}]}.`);
    if (!generated.packet?.verified_facts?.length || generated.variants?.length !== 3) return fallback();
    return { packet: generated.packet, variants: generated.variants, fallbackUsed: false };
  } catch { return fallback(); }
}
