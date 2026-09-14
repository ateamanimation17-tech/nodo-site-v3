import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto max-w-6xl px-6 py-14 grid md:grid-cols-[1.3fr_1fr_1fr] gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Logo size={22} />
            <span className="font-display text-base tracking-wide">NODO</span>
          </div>
          <p className="text-sm text-[color:var(--ink-faint)] max-w-xs leading-relaxed">
            The whole-life operating system. Reset, Finance, and Brain —
            one membership, synced everywhere.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">Product</p>
          <ul className="space-y-2.5 text-sm text-[color:var(--ink-dim)]">
            <li><Link href="/#system" className="hover:text-[color:var(--ink)]">System</Link></li>
            <li><Link href="/pricing" className="hover:text-[color:var(--ink)]">Pricing</Link></li>
            <li><Link href="/blog" className="hover:text-[color:var(--ink)]">Journal</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Account</p>
          <ul className="space-y-2.5 text-sm text-[color:var(--ink-dim)]">
            <li><Link href="/login" className="hover:text-[color:var(--ink)]">Sign in</Link></li>
            <li><Link href="/signup" className="hover:text-[color:var(--ink)]">Start free trial</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-[color:var(--ink-faint)] flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} NODO Lifestyle.</span>
          <span>Made for people done running six apps to manage one life.</span>
        </div>
      </div>
    </footer>
  );
}
