import Link from "next/link";
import Logo from "./Logo";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b hairline backdrop-blur" style={{ background: "rgba(10,12,10,0.82)" }}>
      <div className="mx-auto max-w-6xl px-6 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-display text-lg tracking-wide">NODO</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[color:var(--ink-dim)]">
          <Link href="/#system" className="hover:text-[color:var(--ink)] transition-colors">
            System
          </Link>
          <Link href="/blog" className="hover:text-[color:var(--ink)] transition-colors">
            Journal
          </Link>
          <Link href="/pricing" className="hover:text-[color:var(--ink)] transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-[color:var(--ink-dim)] hover:text-[color:var(--ink)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/pricing"
            className="btn-gold rounded-full px-5 py-2.5 text-sm"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}
