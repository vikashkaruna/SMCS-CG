"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function csrf() { const response = await fetch("/api/auth/csrf"); return (await response.json()).token as string; }

export function LoginForm() { const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(form: FormData) { setBusy(true); setError(""); const token = await csrf(); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": token }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json(); if (!response.ok) setError(data.error); else router.push("/dashboard"); setBusy(false); }
  return <form className="form-grid" action={submit}><div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></div><div className="field"><label htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" required autoComplete="current-password" placeholder="Your password" /></div>{error && <div className="notice notice-error">{error}</div>}<button className="btn btn-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in to studio"}</button></form>; }

export function RegisterForm() { const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(form: FormData) { setBusy(true); setError(""); const token = await csrf(); const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": token }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json(); if (!response.ok) setError(data.error); else router.push("/dashboard"); setBusy(false); }
  return <form className="form-grid" action={submit}><div className="field"><label htmlFor="displayName">Display name</label><input className="input" id="displayName" name="displayName" required minLength={2} placeholder="Your name" /></div><div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></div><div className="field"><label htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" /></div>{error && <div className="notice notice-error">{error}</div>}<button className="btn btn-gold" disabled={busy}>{busy ? "Creating…" : "Create owner account"}</button></form>; }
