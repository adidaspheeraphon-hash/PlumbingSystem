"use client";

import React, { useState, useMemo } from "react";
import { Printer, Download, Home, CheckCircle2, AlertCircle, Banknote, Calendar } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import PaymentModal from "@/components/meter/PaymentModal";
import DataTable, { Column } from "@/components/common/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { useInvoices } from "@/hooks/useInvoices";
import { MeterRecord } from "@/types";

export default function InvoicesPage() {
  const { 
    records, 
    displayRecords, 
    isLoading, 
    mutate, 
    filters, 
    summaries, 
    handleExportCSV 
  } = useInvoices();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MeterRecord | null>(null);

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
            href={`/billing/invoices/print?status=${filters.statusFilter}&cycle=${filters.cycleFilter}`}
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
          value={summaries.totalHouses}
          unit="หลังคาเรือน"
          icon={Home}
          delay={0.1}
        />
        <StatCard
          label="ชำระแล้ว"
          value={formatCurrency(summaries.paidAmount).split('.')[0]}
          unit={`บาท (${summaries.paidCount} หลัง)`}
          icon={CheckCircle2}
          delay={0.2}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="ยังค้างชำระ"
          value={formatCurrency(summaries.unpaidAmount).split('.')[0]}
          unit={`บาท (${summaries.unpaidCount} หลัง)`}
          icon={AlertCircle}
          delay={0.3}
          colorClass="text-rose-600 bg-rose-50"
        />
        <StatCard
          label="รวมยอดทั้งหมด"
          value={formatCurrency(summaries.totalAmount).split('.')[0]}
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
              value={filters.cycleFilter}
              onChange={(e) => filters.setCycleFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-ocean-700 focus:ring-0 outline-none cursor-pointer"
            >
              {filters.cycles.map(c => (
                <option key={c} value={c}>{c === 'ทั้งหมด' ? 'ทั้งหมด' : formatDate(c)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {(["ทั้งหมด", "ค้างชำระ", "ชำระบางส่วน", "ชำระแล้ว"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => filters.setStatusFilter(tab)}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                filters.statusFilter === tab
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
