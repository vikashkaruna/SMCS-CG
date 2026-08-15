"use client";
import { useState } from "react";
import { Link2Off } from "lucide-react";
async function csrf() { const response = await fetch("/api/auth/csrf"); return (await response.json()).token as string; }
export function DisconnectLinkedIn() { const [message, setMessage] = useState(""); async function disconnect() { if (!window.confirm("Disconnect this LinkedIn profile from SMCS?")) return; const response = await fetch("/api/linkedin/disconnect", { method: "POST", headers: { "x-csrf-token": await csrf() } }); setMessage(response.ok ? "Disconnected. Refresh to confirm." : "Unable to disconnect."); } return <><button className="btn btn-danger" onClick={disconnect}><Link2Off size={15} />Disconnect</button>{message && <p className="helper">{message}</p>}</>; }
