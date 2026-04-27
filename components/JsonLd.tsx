/**
 * Reusable JSON-LD structured data component.
 * Drop into any page's JSX to inject schema.org markup.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
