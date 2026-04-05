"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((seg) => seg);

  return (
    <div className="flex items-center text-sm text-muted-foreground space-x-1 mb-6">

      <Link href="/" className="hover:text-primary font-medium text-xs transition-colors flex">
        <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" /> Home
      </Link>

      {segments.map((seg, index) => {
        const label = decodeURIComponent(seg.replace(/-/g, " "));

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4" />
            <span className="capitalize text-foreground text-xs">
              {label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}