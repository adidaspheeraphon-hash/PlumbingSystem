"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Gauge, Search, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: LayoutDashboard, href: "/", label: "แดชบอร์ด" },
  { icon: Gauge, href: "/meter", label: "บันทึก" },
  { icon: Search, href: "/search", label: "ค้นหา" },
  { icon: Users, href: "/records/houses", label: "บ้าน" },
  { icon: Settings, href: "/settings", label: "ตั้งค่า" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 pb-safe bg-white/95 backdrop-blur-xl border-t border-black/5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex-1"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
              pathname === item.href ? "text-ocean-600 font-bold" : "text-slate-400"
            )}
          >
            <item.icon className={cn("w-5 h-5", pathname === item.href && "drop-shadow-[0_0_8px_rgba(2,132,199,0.3)]")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </motion.div>
        </Link>
      ))}
    </nav>
  );
}
