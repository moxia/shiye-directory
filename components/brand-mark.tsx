import type { SVGProps } from "react";

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 44 50" fill="none" aria-hidden="true" {...props}>
      <path d="M2 2H29L42 15V48H2V2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M29 2V15H42" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 24H34M10 31H28M10 38H24" stroke="currentColor" strokeWidth="1.2" />
      <rect x="10" y="10" width="7" height="7" fill="var(--accent)" />
    </svg>
  );
}
