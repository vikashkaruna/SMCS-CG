import { NextResponse } from "next/server";

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (message === "CSRF_FAILED") return NextResponse.json({ error: "Security token expired. Refresh and try again." }, { status: 403 });
  if (message === "EMAIL_IN_USE") return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  if (message === "TOKEN_ENCRYPTION_KEY is required for credential encryption.") return NextResponse.json({ error: "Credential encryption is not configured." }, { status: 503 });
  return NextResponse.json({ error: "The request could not be completed." }, { status: 400 });
}
