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
        <path d="M12.02,17.41c1.23,0,2.23.9,2.23,1.92,0,1.04-.99,1.91-2.23,1.91s-2.23-.87-2.23-1.91c0-1.01,1-1.92,2.23-1.92m5.7-4.24c0-2.31-1.87-3.4-3.32-3.41-.85,0-1.94.63-2.6.63-.67,0-1.53-.61-2.52-.61-1.63,0-3.21,1.11-3.21,3.44,0,2.37,1.86,3.61,3.31,3.61.85,0,1.94-.64,2.62-.64s1.6.64,2.51.64c1.64,0,3.21-1.2,3.21-3.66m-3.14-5.32c.8-.93,1.3-2.2,1.3-3.44,0-.16-.01-.32-.03-.48-.95.05-2.12.63-2.89,1.52-.71.82-1.34,2.08-1.34,3.29,0,.21.01.42.04.62.24,0,.49-.06.73-.06.9,0,1.93-.66,2.19-1.45" />
    </svg>
  );
}
