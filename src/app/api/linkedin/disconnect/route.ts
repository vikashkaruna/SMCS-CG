import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { db } from "@/lib/db";
export async function POST(request: NextRequest) { const user = await getCurrentUser(request); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); try { await requireCsrf(request); await db.oAuthCredential.deleteMany({ where: { userId: user.id, provider: "linkedin" } }); return NextResponse.json({ disconnected: true }); } catch { return NextResponse.json({ error: "Security token expired. Refresh and try again." }, { status: 403 }); } }
