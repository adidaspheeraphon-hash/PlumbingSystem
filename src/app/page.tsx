"use client";

import React from "react";
import useSWR from "swr";
import { apiService } from "@/services/api";
import StatCard from "@/components/dashboard/StatCard";
import { Home, FileSpreadsheet, Droplets, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: res, isLoading } = useSWR("initialData", () => apiService.getInitialData());
  const { data: allMetersRes } = useSWR("allMeters", () => apiService.getMeters());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-ocean-100 border-t-ocean-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const data = res?.data;
  const allMeters = allMetersRes?.data;
  const config = data?.config || [];
  const unitPrice = config.find(c => c['รายการ'] === 'ราคาต่อหน่วย')?.['ค่า'] || "0";

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
        <StatCard 
          label="จำนวนบ้านทั้งหมด" 
          value={data?.houses?.length || 0} 
          unit="หลังคาเรือน" 
          icon={Home} 
          delay={0.1}
        />
        <StatCard 
          label="บันทึกมิเตอร์แล้ว" 
          value={allMeters?.length || data?.meters?.length || 0} 
          unit="รายการ" 
          icon={FileSpreadsheet} 
          delay={0.2}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatCard 
          label="ค่าน้ำต่อหน่วย" 
          value={unitPrice} 
          unit="บาท/หน่วย" 
          icon={Droplets} 
          delay={0.3}
          colorClass="text-blue-500 bg-blue-50"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center px-8 pt-7 pb-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">รายการบันทึกล่าสุด</h2>
          <Link
            href="/meter"
            className="text-sm font-semibold text-ocean-700 border border-ocean-200 bg-ocean-50 hover:bg-ocean-100 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            ไปที่หน้าบันทึก
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-slate-400 uppercase font-semibold tracking-wide border-b border-slate-50">
                <th className="px-6 py-4 text-center">ลำดับที่</th>
                <th className="px-6 py-4">เดือนรอบบิล</th>
                <th className="px-6 py-4 text-center">House ID</th>
                <th className="px-6 py-4 text-center">บ้านเลขที่</th>
                <th className="px-6 py-4 text-center">มิเตอร์ก่อน</th>
                <th className="px-6 py-4 text-center">มิเตอร์ใหม่</th>
                <th className="px-6 py-4 text-center">หน่วยที่ใช้</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.meters && data.meters.length > 0 ? (
                data.meters.slice(0, 10).map((m, idx) => {
                  const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'รอชำระ';
                  return (
                    <tr key={`${m['House ID']}-${m['เดือนรอบบิล']}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-semibold text-slate-500">{idx + 1}</td>
                      <td className="px-6 py-4">{formatDate(m['เดือนรอบบิล'])}</td>
                      <td className="px-6 py-4 text-center font-semibold">{m['House ID'] || "-"}</td>
                      <td className="px-6 py-4 text-center">{m['บ้านเลขที่'] || "-"}</td>
                      <td className="px-6 py-4 text-center">{m['มิเตอร์ครั้งก่อน'] || "0"}</td>
                      <td className="px-6 py-4 text-center">{m['มิเตอร์ครั้งนี้'] || "-"}</td>
                      <td className="px-6 py-4 text-center font-bold">{m['หน่วยที่ใช้'] || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "badge",
                          status === "ชำระแล้ว" ? "bg-success-light" : "bg-warning-light"
                        )}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    ยังไม่มีข้อมูลการบันทึกมิเตอร์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
