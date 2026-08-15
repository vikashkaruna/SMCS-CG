import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth-forms";

export default async function RegisterPage() { if (await getCurrentUser()) redirect("/dashboard"); return <main className="auth-page"><section className="auth-card"><div className="auth-logo"><span className="brand-icon">S</span><strong className="font-display">SMCS Studio</strong></div><h1 className="auth-title">Create your studio.</h1><p className="auth-description">A private workspace for source-backed ideas, reviewed drafts, and intentional publishing.</p><RegisterForm /><p className="auth-footer">Already have an account? <Link href="/login">Sign in</Link></p></section></main>; }
