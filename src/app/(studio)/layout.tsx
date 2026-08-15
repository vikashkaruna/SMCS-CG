import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StudioShell } from "@/components/StudioShell";

export default async function StudioLayout({ children }: { children: React.ReactNode }) { const user = await getCurrentUser(); if (!user) redirect("/login"); return <StudioShell user={user}>{children}</StudioShell>; }
