import crypto from "node:crypto";
import { THEMES } from "./constants";

export function canonicalizeUrl(value: string) {
  const url = new URL(value.trim());
  url.hash = "";
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"].forEach((key) => url.searchParams.delete(key));
  url.hostname = url.hostname.toLowerCase();
  return url.toString().replace(/\/$/, "");
}

export function fingerprint(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function scoreStory(input: { title: string; summary?: string | null; tier: string }) {
  const text = `${input.title} ${input.summary ?? ""}`.toLowerCase();
  const thematicHits = THEMES.filter((theme) => text.includes(theme)).length;
  const tierBonus = { PRIMARY: 35, CREDIBLE: 22, DISCOVERY: 5 }[input.tier] ?? 0;
  return Math.min(100, tierBonus + thematicHits * 12);
}

export type InsightPacket = {
  headline: string;
  verified_facts: { claim: string; source_url: string; source_name: string }[];
  why_it_matters: string;
  india_angle: string;
  healthcare_angle: string;
  contrarian_take: string;
  actionable_lesson: string;
  confidence: "high" | "medium" | "low";
};

export type PostVariant = { angle: string; body: string; hashtags: string[] };

export function defaultInsightPacket(story: { title: string; canonicalUrl: string; publisher: string; summary?: string | null }): InsightPacket {
  return {
    headline: story.title,
    verified_facts: [{ claim: story.summary || story.title, source_url: story.canonicalUrl, source_name: story.publisher }],
    why_it_matters: "Treat this as an operating-model and deployment signal, not merely a model-release headline.",
    india_angle: "Indian builders should assess data location, cost structure, buyer readiness, and governance before adopting the trend.",
    healthcare_angle: "In clinical settings, every workflow change must preserve traceability, permissions, and accountable human review.",
    contrarian_take: "The durable advantage is not autonomous output; it is governed execution inside real workflows.",
    actionable_lesson: "Run a bounded pilot with explicit approval gates, measurable outcomes, and an audit trail.",
    confidence: "medium",
  };
}

export function buildVariants(packet: InsightPacket): PostVariant[] {
  const fact = packet.verified_facts?.[0]?.claim ?? packet.headline;
  return [
    { angle: "Founder/operator", body: `The AI story is not the headline. It is the operating model it forces.\n\n${fact}\n\nHere is what most people are missing:\n\n• Model access is becoming easier to buy.\n• Workflow integration, permissions, and data quality are not.\n• Winning products will pair AI capability with accountable execution.\n\nThe real shift:\n${packet.contrarian_take}\n\nFor founders: ${packet.actionable_lesson}\n\nWhere are you putting the human approval boundary?`, hashtags: ["#AgenticAI", "#EnterpriseAI", "#AIInfrastructure", "#ResponsibleAI", "#IndiaAI"] },
    { angle: "Enterprise governance", body: `AI deployment is becoming a governance decision before it becomes a model decision.\n\n${fact}\n\nWhat changed:\n\n• More work can be delegated to agents.\n• More decisions need traceability.\n• More value depends on who can approve, override, and audit output.\n\nThe real shift:\n${packet.why_it_matters}\n\nEnterprise leaders should start with permissions, escalation paths, and evidence—not a demo.\n\nWhat is your non-negotiable human-in-the-loop control?`, hashtags: ["#AIGovernance", "#EnterpriseAI", "#ResponsibleAI", "#AgenticAI", "#DigitalTransformation"] },
    { angle: "India/regulatory", body: `India's AI opportunity will be shaped by deployment discipline, not just adoption speed.\n\n${fact}\n\nWhy this matters here:\n\n• Infrastructure choices determine cost and sovereignty.\n• Regulated workflows demand evidence and accountability.\n• Buyers will reward systems that fit existing operations.\n\nThe real shift:\n${packet.india_angle}\n\nFor Indian AI builders: ${packet.actionable_lesson}\n\nAre we designing for impressive pilots—or trusted production systems?`, hashtags: ["#IndiaAI", "#AIInfrastructure", "#DataSovereignty", "#EnterpriseAI", "#ResponsibleAI"] },
  ];
}

function escapeXml(value: string) { return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c] ?? c); }
function wrap(text: string, limit: number, max = 4) {
  const lines: string[] = []; let line = "";
  for (const word of text.split(/\s+/)) { if (`${line} ${word}`.trim().length > limit) { lines.push(line); line = word; } else line = `${line} ${word}`.trim(); }
  if (line) lines.push(line); return lines.slice(0, max);
}

export function brandSvg(headline: string, subhead: string) {
  const headlineLines = wrap(headline.toUpperCase(), 24).map((line, i) => `<text x="90" y="${310 + i * 100}" class="headline">${escapeXml(line)}</text>`).join("");
  const subheadLines = wrap(subhead, 55, 5).map((line, i) => `<text x="90" y="${780 + i * 42}" class="subhead">${escapeXml(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#071A2F"/><stop offset="1" stop-color="#123A5A"/></linearGradient><pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0V56" fill="none" stroke="#2CB7D8" stroke-opacity=".14"/></pattern></defs><style>.headline{font-family:Arial,sans-serif;font-size:78px;font-weight:800;fill:#fff}.subhead{font-family:Arial,sans-serif;font-size:31px;fill:#d6e8f2}.meta{font-family:Arial,sans-serif;font-size:25px;font-weight:700;fill:#C89B3C;letter-spacing:3px}</style><rect width="1200" height="1200" fill="url(#g)"/><rect width="1200" height="1200" fill="url(#grid)"/><circle cx="1010" cy="210" r="220" fill="#2CB7D8" opacity=".14"/><rect x="90" y="140" width="160" height="8" fill="#C89B3C"/><text x="90" y="220" class="meta">AXIOM INSIGHT</text>${headlineLines}<line x1="90" y1="680" x2="1110" y2="680" stroke="#C89B3C" stroke-width="3"/>${subheadLines}<text x="90" y="1080" class="meta">AGENTS PROPOSE · HUMANS APPROVE</text></svg>`;
}
