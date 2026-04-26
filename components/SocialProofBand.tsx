import Image from "next/image";

const STATS = [
  { value: "127", label: "Local businesses launched" },
  { value: "$2.4M", label: "Tracked client revenue (2025)" },
  { value: "21 days", label: "Average time to launch" },
  { value: "4.9 / 5", label: "Average client rating" },
];

export default function SocialProofBand() {
  return (
    <section className="relative overflow-hidden">
      {/* Full-width background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&fit=crop"
          alt="Local business team celebrating results"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />
        {/* Dark overlay with violet tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-violet-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: quote */}
          <div>
            <div className="flex gap-1 mb-6">
              {["★","★","★","★","★"].map((s, i) => (
                <span key={i} className="text-amber-400 text-lg">{s}</span>
              ))}
            </div>
            <blockquote
              className="font-display font-bold italic text-white leading-[1.15] tracking-tight mb-8"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
            >
              "We were getting maybe 6 form fills a month. After the rebuild we hit 14 in week eight, and they actually answer the phone now. Best money I've spent on the business in ten years."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-lg">
                MF
              </div>
              <div>
                <p className="text-white font-semibold">Mike Ferraro</p>
                <p className="text-white/50 text-sm">Owner, Buckeye Roofing &amp; Exteriors · Columbus, OH</p>
              </div>
            </div>
          </div>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-6">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
              >
                <div
                  className="font-display font-bold text-white leading-none mb-2"
                  style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
                >
                  {value}
                </div>
                <p className="text-white/50 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
