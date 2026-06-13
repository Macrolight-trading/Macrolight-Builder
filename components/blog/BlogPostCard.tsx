import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import type { BlogFeedEntry } from "@/lib/blog-feed";

const ACCENT = "#C8A24B";

function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostCard({
  post,
  index = 0,
}: {
  post: BlogFeedEntry;
  index?: number;
}) {
  const coverIsRemote = post.coverImage.startsWith("http");

  return (
    <Reveal delay={Math.min(index, 5) * 0.05}>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-500 hover:border-stone-300 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18),0_10px_25px_-12px_rgba(15,23,42,0.10)] hover:-translate-y-1"
      >
        <div className="relative h-52 overflow-hidden bg-stone-100">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            unoptimized={coverIsRemote}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            {post.category ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-stone-700">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: ACCENT }}
                />
                {post.category}
              </span>
            ) : null}
            <span className="text-[0.7rem] text-stone-400">{post.readTime}</span>
          </div>
          <h3
            className="font-display font-semibold text-stone-900 leading-snug tracking-tight mb-3 group-hover:text-stone-700 transition-colors"
            style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)" }}
          >
            {post.title}
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed line-clamp-3 flex-1">
            {post.description}
          </p>
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-stone-100">
            <span className="text-xs text-stone-400">{formatDate(post.date)}</span>
            <span className="text-xs font-medium text-stone-900 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Read article
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
