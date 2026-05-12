import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative">
      <div className="absolute inset-0 dot-bg pointer-events-none opacity-60" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              macro<span className="gradient-text">light</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
          )}
          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-gray-500">{footer}</p>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            &larr; Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
