import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { createPkce, linkedinAuthorization } from "@/lib/services/linkedin";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) { const user = await getCurrentUser(request); if (!user) return NextResponse.redirect(new URL("/login", env.APP_URL)); const state = crypto.randomBytes(24).toString("hex"); const pkce = createPkce(); const response = NextResponse.redirect(linkedinAuthorization(state, pkce.challenge)); response.cookies.set("smcs_linkedin_oauth", JSON.stringify({ state, verifier: pkce.verifier, userId: user.id }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 }); return response; }
