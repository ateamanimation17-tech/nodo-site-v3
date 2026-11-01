import type { Metadata } from "next";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = { title: "Dashboard — NODO" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      <main className="flex-1">{children}</main>
    </>
  );
}
