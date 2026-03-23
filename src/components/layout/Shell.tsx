"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import PageTransition from "@/components/layout/PageTransition";
import { cn } from "@/lib/utils";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Overlay (mobile) */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className={cn(
        "flex-1 flex flex-col px-3 pb-24 pt-3 md:px-6 md:pb-8 md:pt-4 overflow-x-hidden min-w-0 transition-all duration-300",
        // When sticky sidebar is used, main content width is controlled by flex-1
        // but we might want to adjust padding or logic if needed.
        // The sticky layout handles the width automatically via flex-1.
      )}>
        <Header onOpenMenu={() => setIsSidebarOpen(true)} />
        <div className="relative flex-1">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
