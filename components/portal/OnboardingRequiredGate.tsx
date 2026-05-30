import Link from "next/link";

export default function OnboardingRequiredGate() {
  return (
    <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-600">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
        Complete onboarding first
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Plan building unlocks after you finish the onboarding phase. Chat with
        our assistant to submit your project brief, then come back here to pick
        your services.
      </p>
      <Link
        href="/portal/onboarding"
        className="mt-6 inline-flex items-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Go to onboarding →
      </Link>
    </div>
  );
}
