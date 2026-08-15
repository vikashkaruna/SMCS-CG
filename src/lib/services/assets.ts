import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { brandSvg } from "../content";

const assetRoot = path.join(process.cwd(), "storage", "assets");

export async function renderEditorialAsset(headline: string, subhead: string) {
  const svg = brandSvg(headline, subhead);
  const key = `${crypto.randomUUID()}.svg`;
  await fs.mkdir(assetRoot, { recursive: true });
  await fs.writeFile(path.join(assetRoot, key), svg, "utf8");
  return { key, svg, mimeType: "image/svg+xml", checksum: crypto.createHash("sha256").update(svg).digest("hex") };
}

export async function readAsset(key: string) { return fs.readFile(path.join(assetRoot, key)); }
