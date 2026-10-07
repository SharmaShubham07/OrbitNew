"use client";

import * as React from "react";
import { X } from "lucide-react";
import { IconButton } from "./icon-button";
import { cn } from "./button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  className,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-[95vw] h-[90vh]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-3xl bg-surface border-2 border-border-hairline shadow-editorial-lift z-10 max-h-[90vh] flex flex-col",
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {(title || subtitle) && (
          <div className="flex items-center justify-between p-6 border-b border-border-hairline shrink-0">
            <div>
              {title && (
                <h3 className="font-serif text-xl font-bold tracking-tight text-foreground">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-muted-text font-sans mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <IconButton
              label="Close modal"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
