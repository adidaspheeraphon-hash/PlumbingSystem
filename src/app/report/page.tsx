"use client";

import React from "react";
import useSWR from "swr";
import { apiService } from "@/lib/api";
import { BarChart3, FileLineChart, TrendingUp, DollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { data: res } = useSWR("initialData", () => apiService.getInitialData());
  const meters = res?.data?.meters || [];
  
  // Simple summary stats
  const totalRevenue = meters.reduce((acc, m) => {
    const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'รอชำระ';
    if (status === 'ชำระแล้ว') {
      return acc + parseFloat(m['รวมเงิน'] || "0");
    }
    return acc;
  }, 0);

  const pendingRevenue = meters.reduce((acc, m) => {
    const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'รอชำระ';
    if (status !== 'ชำระแล้ว') {
      return acc + parseFloat(m['รวมเงิน'] || "0");
    }
    return acc;
  }, 0);

  const totalUnits = meters.reduce((acc, m) => acc + parseFloat(m['หน่วยที่ใช้'] || "0"), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-lg">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายงานสรุป</h1>
          <p className="text-xs text-slate-400">วิเคราะห์ข้อมูลการเงินและการใช้น้ำภายในหมู่บ้าน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 rounded-2xl border-l-4 border-emerald-500"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">จ่ายแล้ว</span>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">ยอดเงินที่จัดเก็บได้</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{formatCurrency(totalRevenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">รวมทั้งหมดจากระบบ</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl border-l-4 border-amber-500"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">ค้างชำระ</span>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">ยอดเงินค้างชำระ</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{formatCurrency(pendingRevenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">กำลังดำเนินการเรียกเก็บ</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl border-l-4 border-blue-500"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">ปริมาณการใช้น้ำรวม</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{totalUnits.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 mt-2">หน่วย (Units)</p>
        </motion.div>
      </div>

      <div className="glass-card p-10 rounded-2xl text-center">
        <FileLineChart className="w-16 h-16 mx-auto mb-6 text-slate-200" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">สรุปรายงานประจำเดือน</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">ระบบกำลังตรวจสอบข้อมูลเชิงลึกเพิ่มเติม เพื่อแสดงกราฟวิเคราะห์แนวโน้มการใช้น้ำในรอบปี</p>
        <button className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 transition-all shadow-lg">
          ดาวน์โหลดรายงานสรุป (PDF)
        </button>
      </div>
    </div>
  );
}
