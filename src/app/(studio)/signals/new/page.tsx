import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { IngestForm } from "@/components/IngestForm";

export default async function NewSignalPage() { const user = await getCurrentUser(); if (!user) return null; const sources = await db.source.findMany({ where: { userId: user.id, enabled: true }, orderBy: { name: "asc" } }); return <main className="page"><div className="page-header"><div><div className="eyebrow">Manual research intake</div><h1 className="page-title">Add a signal</h1><p className="page-description">Capture the source, not just the headline. Consequential claims should be backed by primary or credible evidence.</p></div></div><div className="card" style={{ maxWidth: 780 }}><IngestForm sources={sources} /></div></main>; }
