import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { posts } from "@/lib/posts";

export const metadata = { title: "The Journal — NODO" };

export default function BlogIndex() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-6 pt-16 pb-14">
            <p className="eyebrow mb-5">The journal</p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl">
              Health & lifestyle, without the noise
            </h1>
            <p className="text-[color:var(--ink-dim)] mt-5 max-w-lg leading-relaxed">
              Short, specific pieces on training, money, and focus — the kind
              you can act on today, not just bookmark.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card p-8 flex flex-col gap-4 hover:border-[color:var(--line-strong)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="eyebrow">{post.category}</p>
                  <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand">
                    {post.readTime} min read
                  </p>
                </div>
                <h2 className="font-display text-2xl leading-snug">
                  {post.title}
                </h2>
                <p className="text-[15px] text-[color:var(--ink-dim)] leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
