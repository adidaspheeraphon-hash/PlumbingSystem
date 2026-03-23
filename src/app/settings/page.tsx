"use client";

import React from "react";
import useSWR from "swr";
import { apiService } from "@/lib/api";
import DataTable from "@/components/common/DataTable";
import { Settings, Info } from "lucide-react";

export default function SettingsPage() {
  const { data: res } = useSWR("initialData", () => apiService.getInitialData());
  const config = res?.data?.config || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-lg">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">การตั้งค่าระบบ</h1>
          <p className="text-xs text-slate-400">ดูข้อมูลการตั้งค่าพื้นฐานของหมู่บ้าน</p>
        </div>
      </div>

      <DataTable
        data={config}
        columns={[
          { header: "รายการ", accessor: "รายการ" },
          { header: "ค่าปัจจุบัน", accessor: "ค่า", className: "text-slate-500" },
          { header: "หน่วย", accessor: "หน่วย/ตัวอย่าง", className: "text-slate-500" },
          { header: "อธิบายเพิ่มเติม", accessor: "หมายเหตุ", className: "text-xs text-slate-500" },
        ]}
      />

      <div className="glass p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3 items-start text-sm text-blue-700 leading-relaxed shadow-sm">
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <span>
          การแก้ไขการตั้งค่า (เช่น ราคาต่อหน่วย, ชื่อหมู่บ้าน) ต้องเข้าไปแก้ไขใน <b>Google Sheet แท็บ &quot;ตั้งค่า&quot;</b> โดยตรงเท่านั้น เมื่อแก้แล้วข้อมูลบนเว็บจะอัปเดตอัตโนมัติ
        </span>
      </div>
    </div>
  );
}
