import { NextResponse } from "next/server";
import { issueCsrfToken } from "@/lib/csrf";
export async function GET() { return NextResponse.json({ token: await issueCsrfToken() }); }
