"use client";

import * as React from "react";
import { X } from "lucide-react";
import { IconButton } from "./icon-button";
import { cn } from "./button";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative w-full rounded-t-3xl bg-surface border-t-2 border-border-hairline shadow-editorial-lift z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300",
          className
        )}
      >
        <div className="flex flex-col items-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-border-hairline" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-border-hairline shrink-0">
            <h3 className="font-serif text-lg font-bold text-foreground">
              {title}
            </h3>
            <IconButton label="Close" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
