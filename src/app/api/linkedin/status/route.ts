import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
export async function GET(request: NextRequest) { const user = await getCurrentUser(request); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); const credential = await db.oAuthCredential.findUnique({ where: { userId_provider: { userId: user.id, provider: "linkedin" } }, select: { memberName: true, memberUrn: true, expiresAt: true } }); return NextResponse.json({ connected: Boolean(credential), credential }); }
