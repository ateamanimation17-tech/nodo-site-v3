import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in — NODO" };

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-4 text-center">Welcome back</p>
          <h1 className="font-display text-3xl text-center mb-8">Sign in</h1>
          <LoginForm />
          <p className="text-sm text-[color:var(--ink-dim)] text-center mt-6">
            No account yet?{" "}
            <Link href="/signup" className="text-[color:var(--accent)]">
              Start your free trial
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
