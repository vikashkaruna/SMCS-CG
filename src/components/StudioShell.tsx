"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileText, LayoutDashboard, Link2, LogOut, Menu, Radio, Settings, SlidersHorizontal, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { Brand } from "./Brand";

const icons = [LayoutDashboard, Radio, FileText, SlidersHorizontal];

export function StudioShell({ user, children }: { user: { displayName: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  async function logout() { const csrf = await (await fetch("/api/auth/csrf")).json(); await fetch("/api/auth/logout", { method: "POST", headers: { "x-csrf-token": csrf.token } }); window.location.href = "/login"; }
  return <div className="app-shell"><aside className={`sidebar ${open ? "open" : ""}`}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Brand /><button className="mobile-menu" style={{ color: "#fff" }} onClick={() => setOpen(false)} aria-label="Close navigation"><X size={19} /></button></div><nav className="nav-stack" aria-label="Main navigation">{NAV_ITEMS.map((item, index) => { const Icon = icons[index]; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link onClick={() => setOpen(false)} className={`nav-link ${active ? "active" : ""}`} href={item.href} key={item.href}><Icon size={17} />{item.label}</Link>; })}<Link className={`nav-link ${pathname.startsWith("/settings") ? "active" : ""}`} href="/settings"><Settings size={17} />Settings</Link></nav><div className="sidebar-spacer" /><div className="sidebar-footer"><strong>Agents propose.</strong><br />Humans approve.<br /><br />Local studio mode keeps every publish intentional.</div></aside><div className="main-area"><header className="topbar"><div style={{ display: "flex", alignItems: "center", gap: 12 }}><button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div><div className="topbar-title">Content command center</div><div className="topbar-subtitle">Verified intelligence → executive point of view</div></div></div><div className="user-chip"><span className="avatar">{user.displayName.slice(0, 1).toUpperCase()}</span><span>{user.displayName}</span><button aria-label="Sign out" className="btn btn-secondary" style={{ padding: 7 }} onClick={logout}><LogOut size={14} /></button></div></header>{children}</div></div>;
}
