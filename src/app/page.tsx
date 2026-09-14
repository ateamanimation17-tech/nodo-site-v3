import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TabMockup from "@/components/TabMockup";
import { posts } from "@/lib/posts";

const pillars = [
  {
    tag: "01 — RESET",
    accent: "var(--green)",
    title: "Train and eat like it's programmed for you, because it is",
    body: "A real 3, 4, or 5-day training split chosen for you, guided set by set. A calorie and macro target that isn't a guess. A 5-day meal rotation that rebuilds itself around that target from 52 real recipes — not a static PDF you'll abandon in a week.",
    features: [
      "Guided workouts with inline weight & rep logging",
      "Macro-matched meal rotation, auto-rebuilt as your targets change",
      "Shopping list that stays in sync with what you're actually eating",
    ],
  },
  {
    tag: "02 — FINANCE",
    accent: "var(--gold)",
    title: "One number that tells you the truth about your money",
    body: "Every wallet, every transaction, every subscription about to renew, in a single live net worth view — not a spreadsheet you update once a month and never open again.",
    features: [
      "Budgets that show overspending before the month ends",
      "Subscription renewal tracking with one-tap pay",
      "Savings goals and a compound growth calculator",
    ],
  },
  {
    tag: "03 — BRAIN",
    accent: "var(--gold-bright)",
    title: "Get your projects out of your head and into one place",
    body: "Life areas, projects, and tasks that connect to each other. A habit tracker that resets itself every morning. A focus timer for the two hours that actually matter.",
    features: [
      "Projects with progress computed from their linked tasks",
      "Daily habit checklist, built-in focus/Pomodoro timer",
      "Reading list, watchlist, and a home for the tools worth keeping",
    ],
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b hairline">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--green-tint), transparent)" }}
          />
          <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            <div>
              <p className="eyebrow mb-6">The whole-life operating system</p>
              <h1 className="font-display text-[2.6rem] leading-[1.05] md:text-[3.6rem] md:leading-[1.03] mb-7">
                Six apps to run one life
                <br />
                is <span className="gold-gradient-text italic">six too many</span>.
              </h1>
              <p className="text-lg md:text-xl text-[color:var(--ink-dim)] max-w-lg mb-9 leading-relaxed">
                NODO puts your training, your food, your money, and your focus
                in one system that actually stays synced — across your phone,
                your laptop, whatever you open next.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href="/pricing"
                  className="btn-gold rounded-full px-7 py-3.5 text-[15px]"
                >
                  Start your reset — €14/mo
                </Link>
                <Link
                  href="#system"
                  className="btn-ghost rounded-full px-7 py-3.5 text-[15px]"
                >
                  See how it works
                </Link>
              </div>
              <p className="text-sm text-[color:var(--ink-faint)]">
                7-day free trial. Cancel anytime, in two clicks.
              </p>
            </div>
            <TabMockup />
          </div>
        </section>

        {/* SYSTEM PILLARS */}
        <section id="system" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-2xl mb-16">
            <p className="eyebrow mb-5">The three tabs</p>
            <h2 className="font-display text-3xl md:text-[2.6rem] leading-tight">
              Not three apps stitched together.
              <br />
              One system, three rooms.
            </h2>
          </div>

          <div className="space-y-20">
            {pillars.map((p, i) => (
              <div
                key={p.tag}
                className={`grid md:grid-cols-2 gap-10 md:gap-16 items-start ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <p
                    className="font-mono-brand text-xs tracking-[0.2em] mb-4"
                    style={{ color: p.accent }}
                  >
                    {p.tag}
                  </p>
                  <h3 className="font-display text-2xl md:text-[1.9rem] mb-4 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-[color:var(--ink-dim)] leading-relaxed mb-6">
                    {p.body}
                  </p>
                  <ul className="space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-3 text-[15px]">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: p.accent }}
                        />
                        <span className="text-[color:var(--ink)]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-8 md:p-10">
                  <div
                    className="h-px w-16 mb-8"
                    style={{ background: p.accent }}
                  />
                  <p className="font-display italic text-xl md:text-2xl leading-snug text-[color:var(--ink)]">
                    &ldquo;
                    {i === 0 &&
                      "The meal rotation rebuilding itself around my numbers is the first fitness thing I haven't quit after two weeks."}
                    {i === 1 &&
                      "I finally know my number. Not an estimate — the actual one."}
                    {i === 2 &&
                      "Everything I was tracking in four different notes apps now lives in one tab."}
                    &rdquo;
                  </p>
                  <p className="eyebrow mt-6" style={{ color: p.accent }}>
                    Early access member
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY NOT NOTION */}
        <section
          className="border-y hairline"
          style={{ background: "var(--bg-raised)" }}
        >
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="eyebrow mb-5">Why not another template</p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight mb-6">
                It isn&rsquo;t a Notion template.
                <br />
                It&rsquo;s a real, running system.
              </h2>
              <p className="text-[color:var(--ink-dim)] leading-relaxed max-w-md">
                No duplicating fifteen linked databases. No widgets that quietly
                stop working. No Notion account at all. Sign in, and it&rsquo;s
                already built, already synced, already yours.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline">
              {[
                ["Setup time", "60 seconds", "A quiz vs. hours of duplicating pages"],
                ["Sync", "Every device", "Not one browser, one file"],
                ["Upkeep", "None", "It rebuilds itself around your numbers"],
                ["Support", "A person", "Not a template you bought once"],
              ].map(([k, v, d]) => (
                <div key={k} className="p-6" style={{ background: "var(--bg-card)" }}>
                  <p className="eyebrow mb-2">{k}</p>
                  <p className="font-display text-2xl mb-1 tabular">{v}</p>
                  <p className="text-sm text-[color:var(--ink-faint)]">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-4xl px-6 py-24 md:py-32">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="eyebrow mb-5">Pricing</p>
            <h2 className="font-display text-3xl md:text-[2.6rem] leading-tight">
              One membership. All three rooms.
            </h2>
          </div>
          <div className="card p-10 md:p-14 grid md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <p className="eyebrow mb-4">NODO Membership</p>
              <p className="text-[color:var(--ink-dim)] leading-relaxed mb-6 max-w-sm">
                Reset, Finance, and Brain — synced across every device, with new
                recipes, templates, and articles added monthly.
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[15px]">
                {[
                  "All three tabs, fully synced",
                  "Guided workouts & meal rotation",
                  "Live net worth & budgets",
                  "Habit tracker & focus timer",
                  "Monthly blog & recipe drops",
                  "Cancel anytime, 7-day trial",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-[color:var(--gold)]">·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center md:text-right md:border-l md:pl-10 hairline">
              <p className="font-display text-5xl tabular mb-1">
                €14<span className="text-xl align-top">/mo</span>
              </p>
              <p className="text-sm text-[color:var(--ink-faint)] mb-6">
                billed monthly, no contract
              </p>
              <Link
                href="/signup"
                className="btn-gold rounded-full px-8 py-3.5 text-[15px] inline-block"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </section>

        {/* BLOG TEASER */}
        <section
          className="border-t hairline"
          style={{ background: "var(--bg-raised)" }}
        >
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <p className="eyebrow mb-5">From the journal</p>
                <h2 className="font-display text-3xl md:text-4xl leading-tight">
                  Health & lifestyle, without the noise
                </h2>
              </div>
              <Link href="/blog" className="btn-ghost rounded-full px-6 py-3 text-sm">
                Read the journal →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card p-7 flex flex-col gap-4 hover:border-[color:var(--line-strong)] transition-colors"
                >
                  <p className="eyebrow">{post.category}</p>
                  <h3 className="font-display text-xl leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[color:var(--ink-dim)] leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand">
                    {post.readTime} min read
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
