"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner = ({ size = 32, className }: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(
        "border-4 border-muted border-t-primary rounded-full animate-spin",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
};