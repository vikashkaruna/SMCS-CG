import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { CSRF_COOKIE } from "./auth";

export async function issueCsrfToken() {
  const token = crypto.randomBytes(24).toString("hex");
  (await cookies()).set(CSRF_COOKIE, token, { httpOnly: false, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 });
  return token;
}

export async function requireCsrf(request: NextRequest) {
  const header = request.headers.get("x-csrf-token");
  const cookie = request.cookies.get(CSRF_COOKIE)?.value;
  if (!header || !cookie || header.length !== cookie.length || !crypto.timingSafeEqual(Buffer.from(header), Buffer.from(cookie))) throw new Error("CSRF_FAILED");
}
