"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { apiService, MeterRecord } from "@/lib/api";
import { Printer, Download, Home, CheckCircle2, AlertCircle, Banknote, Calendar } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import PaymentModal from "@/components/meter/PaymentModal";
import DataTable, { Column } from "@/components/common/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InvoicesPage() {
  const { data: res, mutate, isLoading } = useSWR("meterRecords", () => apiService.getMeterRecords({ limit: 500 }));
  const records = useMemo(() => res?.data || [], [res?.data]);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MeterRecord | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<"ทั้งหมด" | "ค้างชำระ" | "ชำระแล้ว" | "ชำระบางส่วน">("ทั้งหมด");
  const [cycleFilter, setCycleFilter] = useState<string>("ทั้งหมด");

  // Extract unique cycles for the dropdown
  const cycles = useMemo(() => {
    const unique = new Set<string>();
    records.forEach(r => {
      if (r['เดือนรอบบิล']) unique.add(r['เดือนรอบบิล']);
    });
    return ["ทั้งหมด", ...Array.from(unique)].sort((a, b) => {
      if (a === "ทั้งหมด") return -1;
      if (b === "ทั้งหมด") return 1;
      return b.localeCompare(a); // Sort descending normally
    });
  }, [records]);

  // Derived filtered records
  const displayRecords = useMemo(() => {
    return records.filter(m => {
      const pStatus = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
      const pCycle = m['เดือนรอบบิล'] || '';

      const matchStatus = statusFilter === "ทั้งหมด" || pStatus === statusFilter;
      const matchCycle = cycleFilter === "ทั้งหมด" || pCycle === cycleFilter;

      return matchStatus && matchCycle;
    });
  }, [records, statusFilter, cycleFilter]);

  // Calculate summaries based on current filtered records
  const totalHouses = displayRecords.length;
  let paidAmount = 0;
  let paidCount = 0;
  let unpaidAmount = 0;
  let unpaidCount = 0;
  let totalAmount = 0;

  displayRecords.forEach(m => {
    const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
    const amount = Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0);
    totalAmount += amount;
    if (status === 'ชำระแล้ว') {
      paidAmount += amount;
      paidCount++;
    } else {
      unpaidAmount += amount;
      unpaidCount++;
    }
  });

  const handleExportCSV = () => {
    const headers = ["เลขที่ใบแจ้งหนี้", "เดือนรอบบิล", "บ้านเลขที่", "ชื่อเจ้าของ", "มิเตอร์ครั้งก่อน", "มิเตอร์ครั้งนี้", "หน่วยที่ใช้", "ยอดรวมที่ต้องชำระ", "สถานะการชำระ"];
    const rows = displayRecords.map(m => {
      const idx = records.indexOf(m);
      const invNo = `INV-${(m['เดือนรอบบิล'] || '').replace(/-/g, '').substring(0, 6)}-${String(idx + 1).padStart(3, '0')}`;
      return [
        invNo,
        m['เดือนรอบบิล'] || '',
        m['บ้านเลขที่'] || '',
        m['ชื่อเจ้าของ'] || '',
        m['มิเตอร์ครั้งก่อน'] || '',
        m['มิเตอร์ครั้งนี้'] || '',
        m['หน่วยที่ใช้'] || '',
        m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0,
        m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n'); // Add BOM for Excel Thai support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_${cycleFilter !== 'ทั้งหมด' ? cycleFilter : 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<MeterRecord>[] = useMemo(() => [
    {
      header: "เลขที่ใบแจ้งหนี้",
      accessor: (m: MeterRecord) => {
        const originalIdx = records.indexOf(m);
        return <span className="text-slate-500 font-mono text-xs">INV-{(m['เดือนรอบบิล'] || '').replace(/-/g, '').substring(0, 6)}-{String(originalIdx + 1).padStart(3, '0')}</span>;
      }
    },
    { header: "บ้านเลขที่", accessor: "บ้านเลขที่", className: "text-slate-500 font-medium" },
    { header: "ชื่อเจ้าของ", accessor: (m: MeterRecord) => m['ชื่อเจ้าของ'] || "-", className: "text-slate-500" },
    { header: "มิเตอร์ก่อน", accessor: "มิเตอร์ครั้งก่อน", className: "text-center text-slate-500" },
    { header: "มิเตอร์นี้", accessor: "มิเตอร์ครั้งนี้", className: "text-center text-slate-500" },
    { header: "หน่วย", accessor: "หน่วยที่ใช้", className: "text-center font-bold text-ocean-600" },
    {
      header: "ยอดค่าน้ำ",
      accessor: (m: MeterRecord) => formatCurrency(Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0)),
      className: "text-right font-bold text-slate-700"
    },
    {
      header: "สถานะ",
      accessor: (m: MeterRecord) => {
        const statusStr = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
        const isPaid = statusStr === 'ชำระแล้ว';
        const isPartial = statusStr === 'ชำระบางส่วน';
        return (
          <span className={cn(
            "badge shadow-sm",
            isPaid ? "bg-success-light" : isPartial ? "bg-warning-light" : "bg-danger-light text-rose-700"
          )}>
            {statusStr}
          </span>
        );
      },
      className: "text-center text-slate-500"
    },
    {
      header: "จัดการ",
      accessor: (m: MeterRecord) => {
        const statusStr = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
        const isPaid = statusStr === 'ชำระแล้ว';
        return (
          <div className="flex items-center justify-center gap-2">
            {!isPaid && (
              <button
                onClick={() => { setSelectedRecord(m); setIsPaymentModalOpen(true); }}
                className="text-xs font-bold text-ocean-700 bg-ocean-50 hover:bg-ocean-100 border border-ocean-200 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center gap-1"
              >
                <Banknote className="w-3.5 h-3.5" /> รับชำระ
              </button>
            )}
            <Link
              href={`/billing/invoices/print?houseId=${encodeURIComponent(m['บ้านเลขที่'])}&cycle=${encodeURIComponent(m['เดือนรอบบิล'] || '')}`}
              target="_blank"
              className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> พิมพ์
            </Link>
          </div>
        );
      },
      className: "text-center"
    }
  ], [records]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-ocean-100 border-t-ocean-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">กำลังโหลดข้อมูลใบแจ้งหนี้...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">
      {/* Header Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ระบบใบแจ้งหนี้</h1>
          <p className="text-sm font-medium text-slate-500">จัดการและพิมพ์ใบแจ้งหนี้ค่าน้ำประปา</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white backdrop-blur-md border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-600 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ดาวน์โหลด CSV</span>
          </button>

          <Link
            href={`/billing/invoices/print?status=${statusFilter}&cycle=${cycleFilter}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl shadow-sm text-sm font-semibold transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ตามที่กรอง</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          label="จำนวนตามเงื่อนไข"
          value={totalHouses}
          unit="หลังคาเรือน"
          icon={Home}
          delay={0.1}
        />
        <StatCard
          label="ชำระแล้ว"
          value={formatCurrency(paidAmount).split('.')[0]}
          unit={`บาท (${paidCount} หลัง)`}
          icon={CheckCircle2}
          delay={0.2}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="ยังค้างชำระ"
          value={formatCurrency(unpaidAmount).split('.')[0]}
          unit={`บาท (${unpaidCount} หลัง)`}
          icon={AlertCircle}
          delay={0.3}
          colorClass="text-rose-600 bg-rose-50"
        />
        <StatCard
          label="รวมยอดทั้งหมด"
          value={formatCurrency(totalAmount).split('.')[0]}
          unit="บาท"
          icon={Banknote}
          delay={0.4}
          colorClass="text-ocean-700 bg-ocean-50"
        />
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 p-4 bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 rounded-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">รอบบิล:</span>
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-ocean-700 focus:ring-0 outline-none cursor-pointer"
            >
              {cycles.map(c => (
                <option key={c} value={c}>{c === 'ทั้งหมด' ? 'ทั้งหมด' : formatDate(c)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {(["ทั้งหมด", "ค้างชำระ", "ชำระบางส่วน", "ชำระแล้ว"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                statusFilter === tab
                  ? "bg-white text-ocean-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <DataTable
          data={displayRecords}
          columns={columns}
          searchKey="บ้านเลขที่"
          searchPlaceholder="ค้นหาบ้านเลขที่..."
        />
      </motion.div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        record={selectedRecord}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
