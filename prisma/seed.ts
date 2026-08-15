process.env.DATABASE_URL ??= "file:./dev.db";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const demoEmail = "demo@smcs.local";
  const demoPassword = "demo1234";
  const user = await db.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: { email: demoEmail, passwordHash: await bcrypt.hash(demoPassword, 12), displayName: "SMCS Owner" },
  });

  const sources = [
    ["OpenAI News", "https://openai.com/news/", "PRIMARY"],
    ["Anthropic News", "https://www.anthropic.com/news", "PRIMARY"],
    ["Google AI Blog", "https://blog.google/technology/ai/", "PRIMARY"],
    ["MeitY India", "https://www.meity.gov.in/", "PRIMARY"],
    ["Reuters Technology", "https://www.reuters.com/technology/", "CREDIBLE"],
    ["Saved Research", "https://research.local/saved", "PRIMARY"],
  ] as const;

  for (const [name, url, tier] of sources) {
    await db.source.upsert({ where: { url }, update: { name, tier, userId: user.id }, create: { name, url, tier, userId: user.id } });
  }

  await db.styleProfile.upsert({
    where: { id: "default-style-profile" },
    update: {},
    create: {
      id: "default-style-profile",
      userId: user.id,
      name: "Axiom executive voice",
      guide: "Use a strong hook, crisp paragraphs, scan-friendly bullets, a contrarian insight, relevance for AI operators and Indian enterprise, light emojis only when useful, and a practical CTA. Never add unsupported facts.",
    },
  });

  const existingStory = await db.story.findFirst({ where: { userId: user.id } });
  if (!existingStory) {
    const source = await db.source.findFirstOrThrow({ where: { userId: user.id, tier: "PRIMARY" } });
    await db.story.create({
      data: {
        userId: user.id,
        sourceId: source.id,
        canonicalUrl: "https://research.local/saved/ai-workflow-governance",
        title: "Enterprise AI is becoming an operating-model decision",
        publisher: source.name,
        summary: "Organizations are moving from isolated model experiments toward governed AI workflows with explicit permissions and human review.",
        fingerprint: "seed-enterprise-ai-operating-model",
        relevanceScore: 82,
        verificationScore: 0.9,
        status: "QUALIFIED",
        claims: { create: [{ statement: "Organizations are moving from isolated model experiments toward governed AI workflows with explicit permissions and human review.", confidence: 0.9, sourceUrl: source.url, sourceName: source.name, isPrimary: true }] },
      },
    });
  }
}

main().finally(() => db.$disconnect());
