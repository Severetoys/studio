
"use client";

import { cn } from "@/lib/utils";

// TypeScript needs to know about the custom element to not throw errors.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'apple-pay-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        buttonstyle?: string;
        type?: string;
        locale?: string;
        onClick?: React.MouseEventHandler<HTMLElement>;
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
    <>
      <style>
        {`
          apple-pay-button {
            --apple-pay-button-width: 100%;
            --apple-pay-button-height: 48px;
            --apple-pay-button-border-radius: 8px;
            --apple-pay-button-padding: 0px 0px;
            --apple-pay-button-box-sizing: border-box;
            cursor: pointer;
            transition: all 0.3s ease-in-out;
          }
           apple-pay-button:hover {
            transform: scale(1.02);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
           }
        `}
      </style>
      <div className={cn("w-full", className)}>
        <apple-pay-button
          buttonstyle="black"
          type="plain"
          locale="en-US"
          onClick={onClick}
        ></apple-pay-button>
      </div>
    </>
  );
}
