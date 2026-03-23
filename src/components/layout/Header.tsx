"use client";

import React from "react";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const pageConfigs: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "แดชบอร์ด", subtitle: "ภาพรวมระบบประปาของหมู่บ้าน" },
  "/meter": { title: "บันทึกมิเตอร์", subtitle: "บันทึกการใช้น้ำของแต่ละบ้าน" },
  "/records/meter-data": { title: "ข้อมูลมิเตอร์น้ำ", subtitle: "รายการประวัติการบันทึกมิเตอร์น้ำ" },
  "/records/houses": { title: "ข้อมูลบ้าน", subtitle: "รายชื่อและข้อมูลเบื้องต้นของบ้านแต่ละหลัง" },
  "/settings": { title: "ตั้งค่าระบบ", subtitle: "จัดการข้อมูลตั้งค่าพื้นฐานในระบบ" },
  "/search": { title: "ค้นหาขั้นสูง", subtitle: "ค้นหาข้อมูลมิเตอร์แบบละเอียด" },
  "/billing/invoices": { title: "ใบแจ้งหนี้", subtitle: "รายการใบแจ้งหนี้ทั้งหมดของหมู่บ้าน" },
  "/billing/receipts": { title: "ใบเสร็จรับเงิน", subtitle: "รายการใบเสร็จสรุปยอดทั้งหมด" },
  "/report": { title: "รายงาน", subtitle: "สรุปข้อมูลผลสถิติและตัวเลขต่างๆ" },
};

export default function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [currentDate, setCurrentDate] = React.useState("--/--/----");
  const pathname = usePathname();
  
  const config = pageConfigs[pathname] || pageConfigs["/"];

  React.useEffect(() => {
    const d = new Date();
    setCurrentDate(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`);
  }, []);

  return (
    <header className="flex justify-between items-center px-5 py-4 mb-4 md:px-8 md:py-6 md:mb-10 rounded-[2rem] glass-card border-white/60">
      <button 
        className="md:hidden flex items-center justify-center w-11 h-11 rounded-2xl text-slate-600 bg-white/50 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white transition-all mr-3 flex-shrink-0" 
        onClick={onOpenMenu}
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <motion.div 
        key={pathname}
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 min-w-0"
      >
        <span className="text-[10px] uppercase font-black tracking-widest text-ocean-500/80 mb-1 block">Overview Portal</span>
        <h1 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight truncate leading-tight">
          {config.title}
        </h1>
        <p className="text-slate-400 text-[11px] md:text-sm mt-0.5 truncate font-medium">
          {config.subtitle}
        </p>
      </motion.div>

      <div className="flex flex-col items-end gap-2 ml-4">
        <div className="text-[10px] md:text-xs font-black text-ocean-700 bg-gradient-to-tr from-ocean-50 to-sky-50 px-4 py-2 rounded-2xl border border-ocean-100 shadow-sm flex-shrink-0 backdrop-blur-md">
          {currentDate}
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100/50">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[9px] font-bold text-emerald-600/80 uppercase tracking-tighter">Live Monitor</span>
        </div>
      </div>
    </header>
  );
}
