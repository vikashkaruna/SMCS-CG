import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth-forms";

export default async function LoginPage() { if (await getCurrentUser()) redirect("/dashboard"); return <main className="auth-page"><section className="auth-card"><div className="auth-logo"><span className="brand-icon">S</span><strong className="font-display">SMCS Studio</strong></div><h1 className="auth-title">Welcome back.</h1><p className="auth-description">Review the signal. Shape the point of view. Publish only when you approve it.</p><LoginForm /><p className="auth-footer">New to the studio? <Link href="/register">Create your owner account</Link></p></section></main>; }
