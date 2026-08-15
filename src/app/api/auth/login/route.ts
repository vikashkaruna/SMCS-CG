import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, setSessionCookie, verifyCredentials } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { errorResponse } from "@/lib/http";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(request: NextRequest) { try { await requireCsrf(request); const body = schema.parse(await request.json()); const user = await verifyCredentials(body.email, body.password); if (!user) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 }); await setSessionCookie(await createSession(user.id)); return NextResponse.json({ user: { id: user.id, email: user.email } }); } catch (error) { return errorResponse(error); } }
