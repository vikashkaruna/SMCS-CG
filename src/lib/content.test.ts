import { describe, expect, it } from "vitest";
import { brandSvg, buildVariants, canonicalizeUrl, defaultInsightPacket, fingerprint, scoreStory } from "./content";

describe("content domain helpers", () => {
  it("canonicalizes tracking parameters and fragments", () => { expect(canonicalizeUrl("https://Example.com/story/?utm_source=x#section")).toBe("https://example.com/story"); });
  it("creates stable fingerprints", () => { expect(fingerprint("Same headline")).toBe(fingerprint(" same headline ")); });
  it("scores primary thematic stories above the qualification threshold", () => { expect(scoreStory({ title: "Agentic AI governance for enterprise", tier: "PRIMARY" })).toBeGreaterThanOrEqual(35); });
  it("creates three differentiated variants", () => { const packet = defaultInsightPacket({ title: "AI story", canonicalUrl: "https://example.com", publisher: "Example" }); const variants = buildVariants(packet); expect(variants).toHaveLength(3); expect(new Set(variants.map((variant) => variant.angle)).size).toBe(3); });
  it("escapes user content in editorial SVG", () => { const svg = brandSvg('<unsafe>', 'hello & goodbye'); expect(svg).toContain("&lt;UNSAFE&gt;"); expect(svg).toContain("hello &amp; goodbye"); expect(svg).not.toContain("<unsafe>"); });
});
