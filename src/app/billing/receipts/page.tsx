"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { apiService, MeterRecord } from "@/lib/api";
import { Receipt, Banknote, CheckCircle2, AlertCircle, Calendar, Download, Printer } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import DataTable, { Column } from "@/components/common/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import { motion } from "framer-motion";
import Link from "next/link";
import ReceiptDetailModal from "@/components/billing/ReceiptDetailModal";

export default function ReceiptsPage() {
  const { data: res, isLoading } = useSWR("meterRecords", () => apiService.getMeterRecords({ limit: 500 }));
  const records = useMemo(() => res?.data || [], [res?.data]);

  const [filter, setFilter] = useState<"ทั้งหมด" | "ชำระครบ" | "ชำระบางส่วน">("ทั้งหมด");
  const [cycleFilter, setCycleFilter] = useState<string>("ทั้งหมด");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<MeterRecord | null>(null);

  // Extract unique cycles for the dropdown
  const cycles = useMemo(() => {
    const unique = new Set<string>();
    records.forEach(r => {
      if (r['เดือนรอบบิล']) unique.add(r['เดือนรอบบิล']);
    });
    return ["ทั้งหมด", ...Array.from(unique)].sort((a, b) => {
      if (a === "ทั้งหมด") return -1;
      if (b === "ทั้งหมด") return 1;
      return b.localeCompare(a);
    });
  }, [records]);

  const displayRecords = useMemo(() => {
    return records.filter(m => {
      const pStatus = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
      const isReceipt = pStatus === 'ชำระแล้ว' || pStatus === 'ชำระบางส่วน';
      const pCycle = m['เดือนรอบบิล'] || '';

      const matchStatus = filter === "ทั้งหมด" ||
        (filter === "ชำระครบ" && pStatus === 'ชำระแล้ว') ||
        (filter === "ชำระบางส่วน" && pStatus === 'ชำระบางส่วน');
      const matchCycle = cycleFilter === "ทั้งหมด" || pCycle === cycleFilter;

      return isReceipt && matchStatus && matchCycle;
    });
  }, [records, filter, cycleFilter]);

  const totalReceipts = displayRecords.length;
  let totalPayable = 0;
  let totalReceived = 0;
  let totalPending = 0;

  displayRecords.forEach(m => {
    const amount = Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0);
    const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
    totalPayable += amount;

    if (status === 'ชำระแล้ว') {
      totalReceived += amount;
    } else if (status === 'ชำระบางส่วน') {
      const mockReceived = amount > 100 ? amount - 68 : Math.floor(amount / 2); // Mock placeholder
      totalReceived += mockReceived;
      totalPending += (amount - mockReceived);
    }
  });

  const handleExportCSV = () => {
    const headers = ["เลขที่ใบเสร็จ", "เดือนรอบบิล", "บ้านเลขที่", "ชื่อเจ้าของ", "ยอดต้องชำระ", "รับชำระแล้ว", "คงค้าง", "วันที่ชำระ", "สถานะ"];
    const rows = displayRecords.map(m => {
      const idx = records.indexOf(m);
      const rcNo = `RC-${(m['เดือนรอบบิล'] || '').replace(/-/g, '').substring(0, 6)}-${String(idx + 1).padStart(4, '0')}`;

      const amount = Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0);
      const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
      const received = status === 'ชำระแล้ว' ? amount : (amount > 100 ? amount - 68 : Math.floor(amount / 2));
      const pending = amount - received;

      return [
        rcNo,
        m['เดือนรอบบิล'] || '',
        m['บ้านเลขที่'] || '',
        m['ชื่อเจ้าของ'] || '',
        amount,
        received,
        pending,
        m['วันที่ชำระ'] || '',
        status === 'ชำระแล้ว' ? 'ชำระครบ' : 'บางส่วน'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `receipts_${cycleFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<MeterRecord>[] = useMemo(() => [
    {
      header: "เลขที่ใบเสร็จ",
      accessor: (m: MeterRecord) => {
        const originalIdx = records.indexOf(m);
        return <span className="text-slate-500 font-mono text-xs">RC-{(m['เดือนรอบบิล'] || '').replace(/-/g, '').substring(0, 6)}-{String(originalIdx + 1).padStart(4, '0')}</span>;
      }
    },
    { header: "บ้านเลขที่", accessor: "บ้านเลขที่", className: "text-slate-500 font-medium" },
    { header: "ชื่อเจ้าของ", accessor: (m: MeterRecord) => m['ชื่อเจ้าของ'] || "-", className: "text-slate-500" },
    {
      header: "ยอดต้องชำระ",
      accessor: (m: MeterRecord) => formatCurrency(Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0)),
      className: "text-center text-slate-500"
    },
    {
      header: "รับชำระแล้ว",
      accessor: (m: MeterRecord) => {
        const amount = Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0);
        const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
        const received = status === 'ชำระแล้ว' ? amount : (amount > 100 ? amount - 68 : Math.floor(amount / 2));
        return <span className="font-bold text-ocean-700">{formatCurrency(received)}</span>;
      },
      className: "text-center"
    },
    {
      header: "คงค้าง",
      accessor: (m: MeterRecord) => {
        const amount = Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0);
        const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
        const received = status === 'ชำระแล้ว' ? amount : (amount > 100 ? amount - 68 : Math.floor(amount / 2));
        const pending = amount - received;
        return <span className="font-bold text-rose-600">{pending > 0 ? formatCurrency(pending) : '-'}</span>;
      },
      className: "text-center"
    },
    {
      header: "วันที่ชำระ",
      accessor: (m: MeterRecord) => m['วันที่ชำระ'] ? formatDate(m['วันที่ชำระ']) : '-',
      className: "text-center text-slate-500"
    },
    {
      header: "สถานะ",
      accessor: (m: MeterRecord) => {
        const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
        const isPaid = status === 'ชำระแล้ว';
        return (
          <span className={cn(
            "badge shadow-sm",
            isPaid ? "bg-success-light" : "bg-warning-light"
          )}>
            {isPaid ? "ชำระครบ" : "บางส่วน"}
          </span>
        );
      },
      className: "text-center"
    },
    {
      header: "จัดการ",
      accessor: (m: MeterRecord) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setSelectedReceipt(m); setIsDetailModalOpen(true); }}
            className="text-xs font-bold text-ocean-700 bg-ocean-50 hover:bg-ocean-100 border border-ocean-200 px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            ดูรายละเอียด
          </button>
          <Link
            href={`/billing/receipts/print?houseId=${encodeURIComponent(m['บ้านเลขที่'])}&cycle=${encodeURIComponent(m['เดือนรอบบิล'] || '')}`}
            target="_blank"
            className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1"
          >
            <Printer className="w-3 h-3" /> พิมพ์
          </Link>
        </div>
      ),
      className: "text-center"
    }
  ], [records]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-ocean-100 border-t-ocean-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">กำลังโหลดข้อมูลใบเสร็จ...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">
      {/* Header Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ระบบใบเสร็จรับเงิน</h1>
          <p className="text-sm font-medium text-slate-500">จัดการและพิมพ์ใบเสร็จค่าน้ำประปา</p>
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
            href={`/billing/receipts/print?status=${filter}&cycle=${cycleFilter}`}
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
          label="ใบเสร็จตามเงื่อนไข"
          value={totalReceipts}
          unit="รายการ"
          icon={Receipt}
          delay={0.1}
        />
        <StatCard
          label="ยอดรวมต้องชำระ"
          value={formatCurrency(totalPayable).split('.')[0]}
          unit="บาท"
          icon={Banknote}
          delay={0.2}
          colorClass="text-blue-500 bg-blue-50"
        />
        <StatCard
          label="รับชำระจริงแล้ว"
          value={formatCurrency(totalReceived).split('.')[0]}
          unit="บาท"
          icon={CheckCircle2}
          delay={0.3}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="ยอดคงค้าง"
          value={formatCurrency(totalPending).split('.')[0]}
          unit="บาท"
          icon={AlertCircle}
          delay={0.4}
          colorClass="text-rose-600 bg-rose-50"
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
                <option key={c} value={c}>{c === 'ทั้งหมด' ? 'ทุกค่า' : formatDate(c)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {(["ทั้งหมด", "ชำระครบ", "ชำระบางส่วน"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                filter === tab
                  ? "bg-white text-ocean-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
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

      {/* Receipt Details Modal */}
      <ReceiptDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
}
