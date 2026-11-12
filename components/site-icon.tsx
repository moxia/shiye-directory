"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { getFaviconUrl, getInitials } from "@/lib/utils";

interface SiteIconProps {
  name: string;
  url: string;
  iconUrl: string | null;
  className?: string;
}

export function SiteIcon({ name, url, iconUrl, className = "" }: SiteIconProps) {
  const sources = [iconUrl, getFaviconUrl(url)].filter(
    (source): source is string => Boolean(source)
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = sources[sourceIndex];

  return (
    <span className={`site-icon ${className}`} aria-hidden="true">
      <span className="site-icon-fallback">{getInitials(name)}</span>
      {source ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setSourceIndex((index) => index + 1)}
        />
      ) : null}
    </span>
  );
}


