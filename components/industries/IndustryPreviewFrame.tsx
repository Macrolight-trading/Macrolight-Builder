import type { IndustryProfile } from "@/lib/industries";

/**
 * "Site in site" chrome: dark page padding + browser window around a
 * light-themed example site (the child showcase).
 */
export default function IndustryPreviewFrame({
  industry,
  children,
}: {
  industry: IndustryProfile;
  children: React.ReactNode;
}) {
  const host = `${industry.slug}.example.com`;

  return (
    <div className="min-h-full bg-zinc-950 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Macrolight preview
        </p>
        <h1 className="mt-2 text-center text-sm text-zinc-300 sm:text-base">
          Example:{" "}
          <span className="text-white font-medium">{industry.name}</span>{" "}
          <span className="text-zinc-500">· light site in our dark app</span>
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-center text-xs text-zinc-500">
          Scroll the embedded page — this is a representative layout we ship for
          businesses in this niche.
        </p>

        <div
          className="mt-6 overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-900/40 shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:rounded-2xl sm:mt-8"
          role="region"
          aria-label={`Preview of example ${industry.name} site`}
        >
          {/* Simulated window chrome (outer Macrolight UI stays in dark) */}
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-2 py-2 sm:px-3 sm:py-2.5">
            <div className="flex gap-1.5 pl-0.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-0 rounded-md border border-zinc-700/80 bg-zinc-950/80 py-1.5 pl-2 pr-2 text-[10px] text-zinc-500 ring-1 ring-inset ring-zinc-800 sm:text-xs">
              <span className="shrink-0" aria-hidden>
                <svg
                  className="h-3 w-3 text-zinc-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="truncate text-zinc-500">https://</span>
              <span className="min-w-0 flex-1 truncate text-center text-zinc-200">
                {host}
              </span>
            </div>
            <div className="w-6 shrink-0 sm:w-8" aria-hidden />
          </div>

          {/* Light-themed site lives here; no .dark, only explicit light tokens */}
          <div className="industry-site-light bg-zinc-100 text-zinc-900 antialiased">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
