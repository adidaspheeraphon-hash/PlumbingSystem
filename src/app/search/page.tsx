"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { apiService } from "@/services/api";
import { MeterRecord } from "@/types";
import { Search, Redo, Download, AlertCircle } from "lucide-react";
import { validateDateRange } from "@/lib/validations";
import DataTable from "@/components/common/DataTable";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SearchPage() {
  const { data: res } = useSWR("meterRecords", () => apiService.getMeterRecords({ limit: 1000 }));
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    status: "",
    houseNumber: "",
    minUnits: "",
    maxUnits: "",
  });

  const [results, setResults] = useState<MeterRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    setError(null);
    if (!res?.data) return;

    const dateCheck = validateDateRange(filters.startDate, filters.endDate);
    if (!dateCheck.isValid) {
      setError(dateCheck.error!);
      return;
    }

    const filtered = res.data.filter(m => {
      // Basic house number filter
      if (filters.houseNumber && !m['บ้านเลขที่'].includes(filters.houseNumber)) return false;

      // Status filter
      const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'รอชำระ';
      if (filters.status && status !== filters.status) return false;

      // Units range filter
      const units = parseFloat(m['หน่วยที่ใช้'] || "0");
      if (filters.minUnits && units < parseFloat(filters.minUnits)) return false;
      if (filters.maxUnits && units > parseFloat(filters.maxUnits)) return false;

      return true;
    });

    setResults(filtered);
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      houseNumber: "",
      minUnits: "",
      maxUnits: "",
    });
    setResults(null);
    setError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-4 px-8 pt-7 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-lg">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">ค้นหาขั้นสูง</h2>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-slate-400 to-slate-500 shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Redo className="w-4 h-4" />
            ล้างค่า
          </button>
        </div>

        <div className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ช่วงวันที่เริ่มต้น</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ช่วงวันที่สิ้นสุด</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">สถานะการชำระ</label>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none bg-white"
              >
                <option value="">ทั้งหมด</option>
                <option value="ชำระแล้ว">ชำระแล้ว</option>
                <option value="รอชำระ">รอชำระ</option>
                <option value="เลยกำหนด">เลยกำหนด</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">บ้านเลขที่</label>
              <input
                type="text"
                placeholder="เช่น 1, 2, 3"
                value={filters.houseNumber}
                onChange={e => setFilters(f => ({ ...f, houseNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">หน่วยที่ใช้ (ต่ำสุด)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minUnits}
                onChange={e => setFilters(f => ({ ...f, minUnits: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">หน่วยที่ใช้ (สูงสุด)</label>
              <input
                type="number"
                placeholder="999"
                value={filters.maxUnits}
                onChange={e => setFilters(f => ({ ...f, maxUnits: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleSearch}
              className="flex-1 bg-ocean-600 text-white px-4 py-3 rounded-xl hover:bg-ocean-700 transition-colors font-bold shadow-md flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              ค้นหา
            </button>
            <button className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors font-bold flex items-center justify-center gap-2 border border-slate-200">
              <Download className="w-5 h-5" />
              ส่งออกผลลัพธ์
            </button>
          </div>

          {results !== null ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8"
            >
              <DataTable
                data={results}
                columns={[
                  { header: "เดือน", accessor: (m) => formatDate(m['เดือนรอบบิล']) },
                  { header: "บ้านเลขที่", accessor: "บ้านเลขที่", className: "text-center" },
                  { header: "หน่วย", accessor: "หน่วยที่ใช้", className: "text-center font-bold" },
                  {
                    header: "ยอดเงิน",
                    accessor: (m) => formatCurrency(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0),
                    className: "text-right"
                  },
                  {
                    header: "สถานะ",
                    accessor: (m) => {
                      const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'รอชำระ';
                      return (
                        <span className={cn(
                          "badge",
                          status === "ชำระแล้ว" ? "bg-success-light" : "bg-warning-light"
                        )}>
                          {status}
                        </span>
                      );
                    },
                    className: "text-center"
                  },
                ]}
              />
            </motion.div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>กรอกเงื่อนไขและคลิก &quot;ค้นหา&quot; เพื่อดูผลลัพธ์</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
