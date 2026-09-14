import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "Start your trial — NODO" };

export default function SignupPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-4 text-center">7-day free trial</p>
          <h1 className="font-display text-3xl text-center mb-8">
            Start your reset
          </h1>
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
                placeholder="At least 8 characters"
                className="rounded-lg px-3.5 py-2.5 text-[15px] outline-none"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
              />
            </label>
            <button type="submit" className="btn-gold rounded-full px-6 py-3 text-[15px] mt-2">
              Continue to payment
            </button>
            <p className="text-xs text-[color:var(--ink-faint)] text-center leading-relaxed">
              You&rsquo;ll add your card on the next step. No charge for 7
              days — cancel anytime before then.
            </p>
          </form>
          <p className="text-sm text-[color:var(--ink-dim)] text-center mt-6">
            Already a member?{" "}
            <Link href="/login" className="text-[color:var(--gold)]">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
