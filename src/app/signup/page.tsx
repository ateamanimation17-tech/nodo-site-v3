import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SignupForm from "./SignupForm";

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
          <SignupForm />
          <p className="text-sm text-[color:var(--ink-dim)] text-center mt-6">
            Already a member?{" "}
            <Link href="/login" className="text-[color:var(--accent)]">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
