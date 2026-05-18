import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata = {
  title: "Create account",
};

// SignupForm uses useSearchParams() to read ?next= / ?plan= so it can
// resume a checkout after the user finishes signing up. Next.js 14
// requires that to live inside a Suspense boundary so the page can be
// statically rendered up to the point where the URL params matter.
export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Get access to your Macrolight client portal."
      footer={
        <>
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            Sign in
          </a>
        </>
      }
    >
      <Suspense fallback={<SignupSkeleton />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}

function SignupSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
    </div>
  );
}
