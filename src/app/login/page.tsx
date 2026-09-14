import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "Sign in — NODO" };

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-4 text-center">Welcome back</p>
          <h1 className="font-display text-3xl text-center mb-8">Sign in</h1>
          <form className="card p-8 flex flex-col gap-4">
            <label className="text-sm flex flex-col gap-1.5">
              Email
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="rounded-lg px-3.5 py-2.5 text-[15px] outline-none"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
              />
            </label>
            <label className="text-sm flex flex-col gap-1.5">
              Password
              <input
                type="password"
                required
                placeholder="Your password"
                className="rounded-lg px-3.5 py-2.5 text-[15px] outline-none"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
              />
            </label>
            <button type="submit" className="btn-gold rounded-full px-6 py-3 text-[15px] mt-2">
              Sign in
            </button>
          </form>
          <p className="text-sm text-[color:var(--ink-dim)] text-center mt-6">
            No account yet?{" "}
            <Link href="/signup" className="text-[color:var(--gold)]">
              Start your free trial
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
