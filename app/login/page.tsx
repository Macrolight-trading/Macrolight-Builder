import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Macrolight client portal."
      footer={
        <>
          New here?{" "}
          <a
            href="/signup"
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            Create an account
          </a>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
