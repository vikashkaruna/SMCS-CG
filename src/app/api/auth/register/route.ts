import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, registerUser, setSessionCookie } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { errorResponse } from "@/lib/http";

const schema = z.object({ email: z.string().email(), password: z.string().min(8), displayName: z.string().min(2).max(80) });
export async function POST(request: NextRequest) { try { await requireCsrf(request); const body = schema.parse(await request.json()); const user = await registerUser(body.email, body.password, body.displayName); await setSessionCookie(await createSession(user.id)); return NextResponse.json({ user: { id: user.id, email: user.email } }); } catch (error) { return errorResponse(error); } }
