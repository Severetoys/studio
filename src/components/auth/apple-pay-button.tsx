
"use client";

import React from 'react';
import { cn } from "@/lib/utils";

// This tells TypeScript how to handle the custom <apple-pay-button> element.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'apple-pay-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        buttonstyle?: string;
        type?: string;
        locale?: string;
      };
    }
  }
}

interface ApplePayButtonProps {
  className?: string;
  onClick?: () => void;
}

export function ApplePayButton({ className, onClick }: ApplePayButtonProps) {
  return (
    // The wrapper div is necessary for applying Tailwind classes and handling the click event.
    <div
      onClick={onClick}
      className={cn(
        "w-full h-12 flex items-center justify-center rounded-md bg-black text-white hover:bg-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105 border border-black cursor-pointer",
        className
      )}
    >
      {/* 
        This is the official Apple Pay web component.
        It will be rendered by the Apple Pay SDK script.
        We add some inline styles to control its size within our layout.
      */}
      <apple-pay-button
        buttonstyle="black"
        type="plain"
        locale="en-US"
        style={{
          width: '100%',
          height: '100%',
          minWidth: '100px', // Example min-width
          minHeight: '48px', // Match the parent's height
        }}
      ></apple-pay-button>
    </div>
  );
}
