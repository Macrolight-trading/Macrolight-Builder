import Link from "next/link";
import Image, { type ImageProps } from "next/image";
import type { MDXComponents } from "mdx/types";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
} from "react";

/**
 * Component mapping passed to <MDXRemote /> so MDX blog bodies inherit
 * the same Tailwind styling the old markdown-to-HTML pipeline produced.
 *
 * Class strings here mirror the previous `markdownToHtml` output 1:1
 * so post visuals don't shift after the MDX migration.
 *
 * To use a custom component inside a post, import it in this map and
 * reference it in the .mdx body — e.g. add `Callout` here and write
 * `<Callout>Heads up.</Callout>` in any post.
 */
export const mdxComponents: MDXComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight mb-6"
      style={{ fontSize: "clamp(1.85rem, 3.4vw, 2.5rem)" }}
      {...props}
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="font-display font-semibold text-stone-900 leading-[1.15] tracking-tight mt-14 mb-5"
      style={{ fontSize: "clamp(1.45rem, 2.4vw, 1.9rem)" }}
      {...props}
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="font-display font-semibold text-stone-900 leading-snug tracking-tight mt-10 mb-3"
      style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.25rem)" }}
      {...props}
    />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-[1.0625rem] text-stone-600 leading-[1.75] mb-5"
      {...props}
    />
  ),
  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-stone-900" {...props} />
  ),
  em: (props: HTMLAttributes<HTMLElement>) => (
    <em className="text-stone-700" {...props} />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="my-5 space-y-2 list-disc pl-5 marker:text-stone-300"
      {...props}
    />
  ),
  ol: (props: OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      className="my-5 space-y-2 list-decimal pl-5 marker:text-stone-400"
      {...props}
    />
  ),
  li: (props: LiHTMLAttributes<HTMLLIElement>) => (
    <li className="text-stone-600 leading-relaxed pl-2" {...props} />
  ),
  hr: (props: HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-12 border-stone-200" {...props} />
  ),
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-8 border-l-4 border-stone-300 pl-5 italic text-stone-700"
      {...props}
    />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded bg-stone-100 px-1.5 py-0.5 text-[0.95em] text-stone-900"
      {...props}
    />
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg bg-stone-900 p-4 text-sm text-stone-100"
      {...props}
    />
  ),
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-sm text-stone-700"
        {...props}
      />
    </div>
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border-b border-stone-300 py-2 pr-4 font-semibold text-stone-900"
      {...props}
    />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-b border-stone-200 py-2 pr-4" {...props} />
  ),
  a: ({ href = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const className =
      "text-stone-900 underline decoration-stone-300 decoration-from-font underline-offset-4 hover:decoration-stone-900 transition-colors";
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return <Link href={href} className={className} {...props} />;
    }
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  // Allow `<Image>` to be used directly in MDX bodies with Next/Image's
  // optimization. Pass the required `alt` explicitly to keep TS happy.
  Image: (props: ImageProps) => <Image {...props} />,
};
