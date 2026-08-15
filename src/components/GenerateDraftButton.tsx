"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function csrf() { const response = await fetch("/api/auth/csrf"); return (await response.json()).token as string; }
export function GenerateDraftButton({ storyId, disabled }: { storyId: string; disabled?: boolean }) { const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); async function generate() { setBusy(true); setError(""); const response = await fetch("/api/drafts", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": await csrf() }, body: JSON.stringify({ storyId }) }); const data = await response.json(); if (response.ok) router.push(`/drafts/${data.draft.id}/review`); else { setError(data.error || "Unable to generate"); setBusy(false); } } return <div>{error ? <span className="helper" style={{ color: "#b42318" }}>{error}</span> : <button className="btn btn-cyan" disabled={disabled || busy} onClick={generate}><Sparkles size={14} />{busy ? "Generating…" : disabled ? "Drafted" : "Generate draft"}</button>}</div>; }
