import crypto from "node:crypto";
import { db } from "../db";
import { decryptSecret, encryptSecret } from "../crypto";
import { env } from "../env";

export function createPkce() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function linkedinAuthorization(state: string, challenge: string) {
  if (!env.LINKEDIN_CLIENT_ID) throw new Error("LINKEDIN_NOT_CONFIGURED");
  const params = new URLSearchParams({ response_type: "code", client_id: env.LINKEDIN_CLIENT_ID, redirect_uri: env.LINKEDIN_REDIRECT_URI, state, scope: "openid profile email w_member_social", code_challenge: challenge, code_challenge_method: "S256" });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export async function completeLinkedInOAuth(code: string, verifier: string, userId: string) {
  if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) throw new Error("LINKEDIN_NOT_CONFIGURED");
  const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: env.LINKEDIN_CLIENT_ID, client_secret: env.LINKEDIN_CLIENT_SECRET, redirect_uri: env.LINKEDIN_REDIRECT_URI, code_verifier: verifier }) });
  if (!tokenResponse.ok) throw new Error("LINKEDIN_OAUTH_FAILED");
  const token = await tokenResponse.json() as { access_token: string; expires_in?: number };
  const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!profileResponse.ok) throw new Error("LINKEDIN_PROFILE_FAILED");
  const profile = await profileResponse.json() as { sub: string; name?: string };
  await db.oAuthCredential.upsert({ where: { userId_provider: { userId, provider: "linkedin" } }, update: { memberUrn: `urn:li:person:${profile.sub}`, memberName: profile.name, encryptedAccessToken: encryptSecret(token.access_token), expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : undefined }, create: { userId, provider: "linkedin", memberUrn: `urn:li:person:${profile.sub}`, memberName: profile.name, encryptedAccessToken: encryptSecret(token.access_token), expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : undefined } });
  return { memberUrn: `urn:li:person:${profile.sub}`, memberName: profile.name };
}

export async function publishToLinkedIn(userId: string, commentary: string, asset?: { bytes: Buffer; mimeType: string }) {
  const credential = await db.oAuthCredential.findUnique({ where: { userId_provider: { userId, provider: "linkedin" } } });
  if (!credential) throw new Error("LINKEDIN_NOT_CONNECTED");
  if (credential.expiresAt && credential.expiresAt < new Date()) throw new Error("LINKEDIN_TOKEN_EXPIRED");
  const token = decryptSecret(credential.encryptedAccessToken);
  let imageUrn: string | undefined;
  if (asset) {
    const init = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", { method: "POST", headers: { Authorization: `Bearer ${token}`, "LinkedIn-Version": env.LINKEDIN_API_VERSION, "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" }, body: JSON.stringify({ initializeUploadRequest: { owner: credential.memberUrn } }) });
    if (!init.ok) throw new Error("LINKEDIN_IMAGE_INIT_FAILED");
    const initData = await init.json() as { value: { uploadUrl: string; image: string } };
    const upload = await fetch(initData.value.uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": asset.mimeType }, body: new Uint8Array(asset.bytes) });
    if (!upload.ok) throw new Error("LINKEDIN_IMAGE_UPLOAD_FAILED");
    imageUrn = initData.value.image;
  }
  const response = await fetch("https://api.linkedin.com/rest/posts", { method: "POST", headers: { Authorization: `Bearer ${token}`, "LinkedIn-Version": env.LINKEDIN_API_VERSION, "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" }, body: JSON.stringify({ author: credential.memberUrn, commentary, visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] }, content: imageUrn ? { media: { id: imageUrn, altText: "SMCS editorial card" } } : undefined }) });
  if (!response.ok) throw new Error("LINKEDIN_POST_FAILED");
  return { postUrn: response.headers.get("x-restli-id") ?? `urn:li:share:${Date.now()}`, assetUrn: imageUrn };
}
