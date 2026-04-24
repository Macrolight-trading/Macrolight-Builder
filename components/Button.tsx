import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  /**
   * Use on embedded light pages (e.g. industry "site in site" previews) so
   * buttons are readable even when `html` has `class="dark"`.
   */
  onLight?: boolean;
}

interface ButtonAsButtonProps
  extends ButtonBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  href?: undefined;
}

interface ButtonAsLinkProps extends ButtonBaseProps {
  href: string;
  external?: boolean;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantStyles: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 hover:shadow-glow hover:scale-[1.02] active:scale-[0.99]",
  secondary:
    "text-zinc-900 bg-zinc-100 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 dark:text-white dark:bg-white/[0.06] dark:border-white/10 dark:hover:bg-white/[0.10] dark:hover:border-white/20",
  outline:
    "text-zinc-800 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 dark:text-white dark:bg-transparent dark:border-white/20 dark:hover:bg-white/[0.04] dark:hover:border-white/40",
  ghost:
    "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/[0.06]",
};

/** Variant styles for light UIs (no `dark:` — overrides html.dark) */
const variantStylesOnLight: Record<Variant, string> = {
  primary: variantStyles.primary,
  secondary:
    "text-zinc-900 bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:border-zinc-300",
  outline:
    "text-zinc-800 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300",
  ghost:
    "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/90",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-md",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3.5 text-base rounded-lg",
};

export default function Button(props: ButtonProps) {
  const variant: Variant = props.variant ?? "primary";
  const size: Size = props.size ?? "md";
  const className = props.className ?? "";
  const { icon, children, fullWidth, onLight } = props;

  const table = onLight ? variantStylesOnLight : variantStyles;

  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-violet-400 dark:focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

  const offsetFix = onLight
    ? " focus-visible:ring-offset-white"
    : "";

  const cls = `${baseClasses}${offsetFix} ${table[variant]} ${sizeStyles[size]} ${
    fullWidth ? "w-full" : ""
  } ${className}`;

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          className={cls}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
          {icon}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {children}
        {icon}
      </Link>
    );
  }

  // Strip non-DOM props before spreading remaining attributes to <button>.
  const {
    variant: _variant,
    size: _size,
    className: _className,
    icon: _icon,
    fullWidth: _fullWidth,
    onLight: _onLight,
    children: _children,
    ...buttonProps
  } = props as ButtonAsButtonProps;

  return (
    <button className={cls} {...buttonProps}>
      {children}
      {icon}
    </button>
  );
}
