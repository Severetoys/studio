import type { SVGProps } from "react";

export function AuthKitLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M22.56,12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26,1.37-1.04,2.53-2.21,3.31v2.77h3.57c2.08-1.92,3.28-4.74,3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12,23c2.97,0,5.46-.98,7.28-2.66l-3.57-2.77c-.98,.66-2.23,1.06-3.71,1.06-2.86,0-5.29-1.93-6.16-4.53H2.18v2.84C3.99,20.53,7.7,23,12,23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84,14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43,.35-2.09V7.07H2.18C1.43,8.55,1,10.22,1,12s.43,3.45,1.18,4.93l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12,5.38c1.62,0,3.06,.56,4.21,1.64l3.15-3.15C17.45,2.09,14.97,1,12,1,7.7,1,3.99,3.47,2.18,7.07l3.66,2.84c.87-2.6,3.3-4.53,6.16-4.53Z"
      />
      <path fill="none" d="M1,1h22v22H1Z" />
    </svg>
  );
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.15,6.9c-.92,0-1.85,.49-2.5,1.22-1.54,1.64-2.58,4.24-2.07,6.55,.46,2.07,1.93,3.82,3.47,3.82,.85,0,1.71-.49,2.58-1.29,.01,0,1.47-1.92,1.47-1.92s-1.12,.45-2.43,.45c-1.54,0-2.5-1.02-2.5-2.43s1.02-2.58,2.5-2.58c.21,0,.43,0,.64,.07,0,0,1.64-2.43,1.64-2.43s-1.47-.86-2.79-.86Zm2.21-4.85c1.22-1.36,2.14-3.33,1.93-5.12-1.78,.07-3.55,1.12-4.85,2.43-.97,1.05-1.93,2.86-1.64,4.56,.26,.97,1.09,1.78,1.93,2.14,0,0,.5-.21,.5-.21s.29-.29,.36-.36c.97-1.12,1.47-2.28,1.54-3.54,0-.37,.07-.65,.07-.98Z"
      transform="translate(3.02 3.932)" />
    </svg>
  );
}
