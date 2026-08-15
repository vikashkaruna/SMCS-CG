import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { readAsset } from "@/lib/services/assets";
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) { const user = await getCurrentUser(request); if (!user) return new NextResponse("Unauthorized", { status: 401 }); const { key } = await params; const asset = await db.asset.findFirst({ where: { storageKey: key, draft: { userId: user.id } } }); if (!asset) return new NextResponse("Not found", { status: 404 }); return new NextResponse(await readAsset(key), { headers: { "Content-Type": asset.mimeType, "Cache-Control": "private, max-age=3600" } }); }
