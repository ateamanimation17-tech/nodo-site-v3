import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { posts } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return { title: post ? `${post.title} — NODO Journal` : "NODO Journal" };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-6 py-16 md:py-20">
          <Link
            href="/blog"
            className="text-sm text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] mb-8 inline-block"
          >
            ← The journal
          </Link>
          <p className="eyebrow mb-4">{post.category}</p>
          <h1 className="font-display text-3xl md:text-[2.6rem] leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-sm text-[color:var(--ink-faint)] font-mono-brand mb-12">
            {new Date(post.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {post.readTime} min read
          </p>
          <div className="space-y-6">
            {post.body.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h2 className="font-display text-xl md:text-2xl mt-4 mb-3">
                    {block.heading}
                  </h2>
                )}
                <p className="text-[17px] leading-[1.75] text-[color:var(--ink-dim)]">
                  {block.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 card p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <p className="font-display text-lg leading-snug max-w-sm">
              This is the thinking behind NODO. The app runs it for you.
            </p>
            <Link
              href="/pricing"
              className="btn-accent rounded-full px-6 py-3 text-sm whitespace-nowrap"
            >
              Start free trial
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
