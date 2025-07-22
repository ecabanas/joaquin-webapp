import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 20l-4-4" />
      <path d="M11 16l-4-4" />
      <path d="M14 10l4.38-4.38" />
      <path d="M21 17l-4.38-4.38" />
      <path d="M11.5 2.5L21.5 12.5" />
      <path d="M2.5 11.5L12.5 21.5" />
    </svg>
  );
}
