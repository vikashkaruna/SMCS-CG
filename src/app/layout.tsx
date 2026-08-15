import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "SMCS · Social Media Content Studio", description: "Human-approved LinkedIn content production workspace." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
