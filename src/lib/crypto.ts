import crypto from "node:crypto";
import { env } from "./env";

export function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function encryptionKey() {
  const raw = env.TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("TOKEN_ENCRYPTION_KEY is required for credential encryption.");
  const decoded = Buffer.from(raw, "base64");
  if (decoded.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes.");
  return decoded;
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptSecret(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64"));
  decipher.setAuthTag(Buffer.from(tagText, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64")), decipher.final()]).toString("utf8");
}

export function checksum(value: string) {
  return hash(value);
}
