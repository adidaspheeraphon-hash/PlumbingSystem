import { useState, useMemo } from "react";
import useSWR from "swr";
import { apiService } from "@/services/api";

export function useInvoices() {
  const { data: res, mutate, isLoading } = useSWR("meterRecords", () => apiService.getMeterRecords({ limit: 500 }));
  const records = useMemo(() => res?.data || [], [res?.data]);

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
  const summaries = useMemo(() => {
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

    return {
      totalHouses: displayRecords.length,
      paidAmount,
      paidCount,
      unpaidAmount,
      unpaidCount,
      totalAmount
    };
  }, [displayRecords]);

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

  return {
    records,
    displayRecords,
    isLoading,
    mutate,
    filters: {
      statusFilter,
      setStatusFilter,
      cycleFilter,
      setCycleFilter,
      cycles
    },
    summaries,
    handleExportCSV
  };
}
