import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "Pricing — NODO" };

const faqs = [
  {
    q: "Is this a subscription?",
    a: "Yes — €8/month, billed monthly, no long-term contract. You can cancel from your account settings in two clicks; your access continues until the end of the period you already paid for.",
  },
  {
    q: "What happens after the free trial?",
    a: "Your card is charged automatically when the 5-day trial ends. We'll email you before then, and you can cancel any time before that at no cost.",
  },
  {
    q: "Does my data sync across my devices?",
    a: "Yes — your NODO membership is tied to your account, not your browser, so your training log, budgets, and tasks follow you between your phone and laptop.",
  },
  {
    q: "Can I use just one of the four tabs?",
    a: "The membership includes all four — Projects Management, The Nodo Reset Method, Finances Management, and Anxiety Control — at one price. Most people end up using at least two within the first month.",
  },
  {
    q: "Do I need Notion or any other app?",
    a: "No. NODO is a standalone system — nothing to install, nothing to duplicate, no other account required.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-8 text-center">
          <p className="eyebrow mb-5">Pricing</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-5">
            One membership. All four rooms.
          </h1>
          <p className="text-[color:var(--ink-dim)] max-w-lg mx-auto leading-relaxed">
            Projects Management, The Nodo Reset Method, Finances Management,
            and Anxiety Control, synced across every device — with new
            recipes, templates, and journal entries added every month.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="card p-10 md:p-14 text-center">
            <p className="eyebrow mb-4">NODO Membership</p>
            <p className="font-display text-6xl tabular mb-2">
              €8<span className="text-2xl align-top">/mo</span>
            </p>
            <p className="text-sm text-[color:var(--ink-faint)] mb-8">
              5-day free trial · cancel anytime
            </p>
            <Link
              href="/signup"
              className="btn-accent rounded-full px-9 py-4 text-[15px] inline-block mb-10"
            >
              Start free trial
            </Link>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[15px] text-left max-w-lg mx-auto">
              {[
                "All four tabs — Projects, Reset, Finances, Anxiety",
                "Synced across every device",
                "Guided workouts & macro-matched meals",
                "Live net worth, budgets & income tracking",
                "Habit tracker & focus timer",
                "Worry dump, CBT thought record & guided meditation",
                "Daily steps tracker with weekly & monthly history",
                "Monthly recipe & journal drops",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-[color:var(--accent)]">·</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-16 md:py-20">
          <p className="eyebrow mb-6 text-center">Questions</p>
          <div className="divide-y hairline border-y hairline">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="font-display text-lg mb-2">{f.q}</h3>
                <p className="text-[15px] text-[color:var(--ink-dim)] leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
