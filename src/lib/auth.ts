import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "./db";
import { hash } from "./crypto";

export const SESSION_COOKIE = "smcs_session";
export const CSRF_COOKIE = "smcs_csrf";

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  await db.session.create({ data: { tokenHash: hash(token), userId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) } });
  return token;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hash(token) } });
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(request?: NextRequest) {
  const token = request?.cookies.get(SESSION_COOKIE)?.value ?? (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function requireUser(request?: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function registerUser(email: string, password: string, displayName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new Error("EMAIL_IN_USE");
  return db.user.create({ data: { email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), displayName: displayName.trim() } });
}

export async function verifyCredentials(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return user;
}
