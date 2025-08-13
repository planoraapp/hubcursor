
import React from "react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground">
        © {year} Habinfo. All rights reserved.
      </div>
    </footer>
  );
}
