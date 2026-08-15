import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/http";
import { SOURCE_TIERS } from "@/lib/constants";

const schema = z.object({ name: z.string().min(2).max(120), url: z.string().url(), tier: z.enum(SOURCE_TIERS) });
export async function GET(request: NextRequest) { const user = await getCurrentUser(request); if (!user) return errorResponse(new Error("UNAUTHORIZED")); return NextResponse.json(await db.source.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } })); }
export async function POST(request: NextRequest) { try { const user = await getCurrentUser(request); if (!user) throw new Error("UNAUTHORIZED"); await requireCsrf(request); const body = schema.parse(await request.json()); const source = await db.source.create({ data: { ...body, userId: user.id } }); return NextResponse.json({ source }); } catch (error) { return errorResponse(error); } }
