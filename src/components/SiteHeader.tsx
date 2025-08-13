
import React from "react";
import { Link } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <Link to="/" className="font-semibold text-foreground">
          Habinfo
        </Link>
        <div className="text-sm text-muted-foreground">
          Public beta
        </div>
      </div>
    </header>
  );
}
