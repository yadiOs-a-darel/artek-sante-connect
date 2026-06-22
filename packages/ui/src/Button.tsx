import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#00A651] hover:bg-[#00A651]/90 text-white",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-400",
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button as ArteKButton };
