import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
export async function POST(request: NextRequest) { try { await requireCsrf(request); await clearSession(); return NextResponse.json({ loggedOut: true }); } catch { return NextResponse.json({ error: "Security token expired. Refresh and try again." }, { status: 403 }); } }
