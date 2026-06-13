function textToParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export default function ExternalArticleBody({
  content,
  format,
}: {
  content: string;
  format: "html" | "text";
}) {
  if (format === "html") {
    return (
      <article
        className="external-article max-w-none text-stone-700 leading-relaxed [&_h1]:font-display [&_h1]:font-semibold [&_h1]:text-stone-900 [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-stone-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-stone-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_a]:text-violet-700 [&_a]:underline [&_strong]:text-stone-900"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <article className="max-w-none text-stone-700 leading-relaxed">
      {textToParagraphs(content).map((paragraph, index) => (
        <p key={index} className="mb-4 text-base">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
