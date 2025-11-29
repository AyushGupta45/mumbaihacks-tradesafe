"use client";

import React from "react";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import { cn } from "@/lib/utils";

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { collapsed } = useLayout();

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      <Sidebar />
      <TopNavbar />
      
      <main 
        className={cn(
          "flex-1 mt-24 mr-4 mb-4 overflow-y-auto rounded-2xl glass-panel relative z-0 transition-all duration-300 ease-in-out",
          collapsed ? "ml-28" : "ml-72" // 16px (left gap) + width + 16px (gap to content)
          // Sidebar is left-4 (16px). 
          // Collapsed width: 80px. End: 96px. Gap: 16px. Start content: 112px (ml-28 = 7rem = 112px).
          // Expanded width: 256px. End: 272px. Gap: 16px. Start content: 288px (ml-72 = 18rem = 288px).
        )}
      >
        <div className="min-h-full p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
}
