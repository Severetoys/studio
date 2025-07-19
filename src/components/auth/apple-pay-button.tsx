
"use client";

import { AppleIcon } from "./icons";
import { cn } from "@/lib/utils";

interface ApplePayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ApplePayButton({ className, ...props }: ApplePayButtonProps) {
  return (
    <button
      className={cn(
        "h-12 w-full",
        "bg-black text-white",
        "rounded-md",
        "inline-flex items-center justify-center",
        "transition-all duration-300 ease-in-out",
        "transform hover:scale-105",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span style={{ fontFamily: "-apple-system, sans-serif" }} className="text-lg font-light">Buy with</span>
      <AppleIcon className="h-6 w-9 fill-white" />
    </button>
  );
}
