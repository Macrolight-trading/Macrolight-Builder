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
  /** Use on embedded light pages (e.g. industry "site in site" previews) */
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
    "text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 shadow-md shadow-violet-200 hover:shadow-violet-300 active:scale-[0.99]",
  secondary:
    "text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300",
  outline:
    "text-gray-700 bg-transparent border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
  ghost:
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
};

const sizeStyles: Record<Size, string> = {
  sm:  "px-4 py-2 text-sm rounded-md",
  md:  "px-5 py-2.5 text-sm rounded-lg",
  lg:  "px-7 py-3.5 text-base rounded-lg",
};

export default function Button(props: ButtonProps) {
  const variant: Variant = props.variant ?? "primary";
  const size: Size = props.size ?? "md";
  const className = props.className ?? "";
  const { icon, children, fullWidth } = props;

  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

  const cls = `${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${
    fullWidth ? "w-full" : ""
  } ${className}`;

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a href={props.href} className={cls} target="_blank" rel="noopener noreferrer">
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
