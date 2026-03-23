"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { 
  Droplets, 
  LayoutDashboard, 
  Gauge, 
  TableProperties, 
  Users, 
  Settings, 
  Search, 
  FileText, 
  Receipt,
  X,
  ChevronLeft,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "แดชบอร์ด", icon: LayoutDashboard, href: "/" },
  { name: "บันทึกมิเตอร์", icon: Gauge, href: "/meter" },
  { name: "ข้อมูลมิเตอร์น้ำ", icon: TableProperties, href: "/records/meter-data" },
  { name: "ข้อมูลบ้าน", icon: Users, href: "/records/houses" },
  { name: "รายงาน", icon: PieChart, href: "/report" },
  { name: "ใบแจ้งหนี้", icon: FileText, href: "/billing/invoices" },
  { name: "ใบเสร็จรับเงิน", icon: Receipt, href: "/billing/receipts" },
  { name: "ค้นหาขั้นสูง", icon: Search, href: "/search" },
  { name: "ตั้งค่าระบบ", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed md:sticky top-0 md:top-4 left-0 h-full md:h-[calc(100vh-2rem)] flex-shrink-0 md:ml-4 md:my-4 flex flex-col z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] glass rounded-none md:rounded-[2rem] shadow-2xl border-white/40",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Collapse Toggle - Floating Pill */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-24 w-7 h-12 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-ocean-600 hover:border-ocean-300 shadow-lg z-20 transition-all duration-300 group overflow-hidden"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Header / Logo Section */}
      <div className={cn(
        "flex items-center px-4 py-8 relative",
        isCollapsed ? "justify-center" : "px-6 gap-4"
      )}>
        <motion.div 
          layout
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_25px_-5px_rgba(2,132,199,0.5)] flex-shrink-0 bg-gradient-to-tr from-ocean-600 via-ocean-500 to-sky-400"
        >
          <Droplets className="w-7 h-7" />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col overflow-hidden"
            >
              <h2 className="text-lg font-black text-slate-800 tracking-tight whitespace-nowrap leading-none">
                ประปาหมู่บ้าน
              </h2>
              <span className="text-[10px] uppercase tracking-widest font-bold text-ocean-500 mt-1">Village Water</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Close */}
        <button 
          className="md:hidden ml-auto w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Space */}
      <motion.nav 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block relative group"
            >
              <motion.div
                variants={itemVariants}
                className={cn(
                  "flex items-center rounded-2xl text-sm transition-all duration-400 relative h-12",
                  isCollapsed ? "justify-center w-12 mx-auto" : "px-4 w-full gap-3",
                  isActive 
                    ? "text-ocean-700 font-bold" 
                    : "text-slate-500 hover:text-slate-900"
                )}
                title={isCollapsed ? item.name : ""}
              >
                {/* Active Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-ocean-50 to-sky-50 rounded-2xl border border-ocean-100/50 shadow-sm -z-10"
                  />
                )}
                
                {/* Hover Background */}
                <div className="absolute inset-0 bg-slate-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-20" />

                <div className={cn(
                  "transition-all duration-300",
                  isActive ? "text-ocean-600 scale-110" : "group-hover:scale-110"
                )}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                </div>

                {!isCollapsed && (
                  <span className="whitespace-nowrap truncate">{item.name}</span>
                )}

                {isActive && !isCollapsed && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>

      {/* Footer Info */}
      <div className={cn(
        "p-4 mt-auto transition-all duration-300",
        isCollapsed ? "items-center" : "px-6"
      )}>
        <div className={cn(
          "bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-100 p-3 flex items-center transition-all duration-300",
          isCollapsed ? "justify-center w-12 h-12 p-0 rounded-full" : "gap-3"
        )}>
          <div className="relative flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></span>
            <div className="w-3 h-3 rounded-full bg-emerald-500 relative z-10 border-2 border-white shadow-sm"></div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-slate-700 leading-none">ระบบพร้อมใช้งาน</span>
              <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">Connection Stable</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
