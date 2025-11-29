"use client";

import React from "react";

// This component is not currently used in the application
// It's a placeholder for future shadcn sidebar implementation
// The current app uses components/layout/Sidebar.tsx instead

export default function AppSidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          Placeholder Sidebar Component
        </p>
      </div>
    </div>
  );
}
