"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "./button";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  withOrbit?: boolean;
  status?: "online" | "offline" | "busy" | null;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  withOrbit = false,
  status = null,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
    "2xl": "w-28 h-28 text-3xl",
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = fallback || getInitials(alt);

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      {...props}
    >
      {withOrbit && (
        <>
          <div className="orbit-ring-pulse" />
          <div className="orbit-ring" />
        </>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-raised border border-border-hairline flex items-center justify-center font-serif font-bold text-foreground select-none z-10",
          sizeClasses[size]
        )}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="112px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="tracking-tighter">{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 z-20 block rounded-full ring-2 ring-background",
            size === "xs" || size === "sm" ? "w-2 h-2" : "w-3 h-3",
            status === "online" && "bg-emerald-500",
            status === "offline" && "bg-stone-400",
            status === "busy" && "bg-amber-500"
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
