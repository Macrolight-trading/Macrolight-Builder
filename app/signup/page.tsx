import SignupForm from "@/components/auth/SignupForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata = {
  title: "Create account",
};

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
      <SignupForm />
    </AuthShell>
  );
}
