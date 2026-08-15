import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewEditor } from "@/components/ReviewEditor";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) { const user = await getCurrentUser(); if (!user) return null; const { id } = await params; const draft = await db.draft.findFirst({ where: { id, userId: user.id }, include: { story: { include: { claims: true, source: true } }, assets: true, publishLogs: { orderBy: { createdAt: "desc" }, take: 3 } } }); if (!draft) notFound(); return <ReviewEditor draft={JSON.parse(JSON.stringify(draft))} />; }
