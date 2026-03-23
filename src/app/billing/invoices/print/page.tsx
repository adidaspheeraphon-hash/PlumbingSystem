"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { apiService } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

function PrintContent() {
  const searchParams = useSearchParams();
  const houseId = searchParams.get("houseId");
  const pStatus = searchParams.get("status");
  const pCycle = searchParams.get("cycle");

  const { data: res, isLoading } = useSWR("meterRecords", () => apiService.getMeterRecords({ limit: 500 }));
  const records = useMemo(() => res?.data || [], [res?.data]);
  
  const [hasPrinted, setHasPrinted] = useState(false);

  // Filter records based on params
  const printRecords = useMemo(() => {
    if (!records.length) return [];
    
    if (houseId) {
      // Single print (still use the 8-per-page logic but it will just be 1 item on 1 page)
      const cycle = searchParams.get("cycle");
      return records.filter(m => m['บ้านเลขที่'] === houseId && (!cycle || m['เดือนรอบบิล'] === cycle));
    } else {
      // Bulk print
      return records.filter(m => {
        const statusStr = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
        const matchStatus = pStatus && pStatus !== "ทั้งหมด" ? statusStr === pStatus : true;
        const matchCycle = pCycle && pCycle !== "ทั้งหมด" ? m['เดือนรอบบิล'] === pCycle : true;
        return matchStatus && matchCycle;
      });
    }
  }, [records, houseId, pStatus, pCycle, searchParams]);

  // Chunk array into groups of 8
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < printRecords.length; i += 8) {
      result.push(printRecords.slice(i, i + 8));
    }
    return result;
  }, [printRecords]);

  // Trigger print dialog when data is loaded
  useEffect(() => {
    if (!isLoading && printRecords.length > 0 && !hasPrinted) {
      const timer = setTimeout(() => {
        window.print();
        setHasPrinted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, printRecords.length, hasPrinted]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-ocean-100 border-t-ocean-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">กำลังเตรียมข้อมูลใบแจ้งหนี้...</p>
      </div>
    );
  }

  if (printRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-slate-500 font-medium">ไม่พบข้อมูลใบแจ้งหนี้ที่ต้องการพิมพ์</p>
      </div>
    );
  }

  return (
    <div id="print-root" className="min-h-screen bg-slate-100 print:bg-white text-slate-800">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide Shell components */
          aside, header, nav, .bottom-nav { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          .page-break { page-break-after: always; break-after: page; }
          .no-print { display: none !important; }
        }
      `}} />
      
      {/* Print Action Header (Hidden in print) */}
      <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center no-print bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ตัวอย่างก่อนพิมพ์</h1>
          <p className="text-sm text-slate-500">จำนวนที่เลือกพิมพ์: {printRecords.length} รายการ (8 ใบต่อ 1 หน้า A4)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.close()}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ปิดหน้าต่าง
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-semibold text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg shadow-sm transition-colors"
          >
            พิมพ์ใบแจ้งหนี้
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="flex flex-col items-center">
        {chunks.map((chunk, pageIdx) => (
          <div 
            key={pageIdx} 
            className="page-break bg-white w-[210mm] min-h-[297mm] p-2 print:p-0 print:w-full print:border-none border border-slate-300 shadow-sm mb-4"
          >
            <div className="grid grid-cols-2 grid-rows-4 h-full print:h-[287mm] gap-x-2 gap-y-4 print:gap-x-1 print:gap-y-2 content-start">
              {chunk.map((m, idx) => {
                const amount = Number(m['ยอดรวมที่ต้องชำระ'] || m['รวมเงิน'] || 0);
                const arrears = Number(m['ยอดยกมา'] || 0);
                const fines = Number(m['ค่าปรับ'] || 0);
                const totalAmount = amount + arrears + fines;
                const originalIdx = records.indexOf(m);
                const invoiceNo = `INV-${(m['เดือนรอบบิล'] || '').replace(/-/g, '').substring(0, 6)}-${String(originalIdx + 1).padStart(3, '0')}`;

                return (
                  <div key={idx} className="border border-slate-400 p-3 h-[70mm] print:h-[100%] flex flex-col justify-between rounded-md">
                    {/* Header */}
                    <div className="text-center border-b border-slate-300 pb-1 mb-1">
                      <h2 className="text-[12px] font-bold text-slate-800">ใบแจ้งหนี้ค่าน้ำประปา หมู่บ้านร่มโพธิ์ทอง</h2>
                      <p className="text-[10px] text-slate-600">รอบบิล: <span className="font-bold">{formatDate(m['เดือนรอบบิล'] || '')}</span></p>
                    </div>

                    {/* Customer Info */}
                    <div className="flex justify-between text-[10px] mb-1">
                      <div>
                        <span className="text-slate-600">บ้านเลขที่:</span> <span className="font-bold">{m['บ้านเลขที่']}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">เลขที่:</span> <span className="font-bold font-mono">{invoiceNo}</span>
                      </div>
                    </div>
                    <div className="text-[10px] mb-2 truncate">
                      <span className="text-slate-600">ชื่อ:</span> <span className="font-bold">{m['ชื่อเจ้าของ'] || "-"}</span>
                    </div>

                    {/* Meter Table */}
                    <div className="flex text-[10px] border border-slate-300 rounded overflow-hidden text-center mb-2">
                      <div className="flex-1 border-r border-slate-300 bg-slate-50">
                        <div className="border-b border-slate-300 py-0.5">ครั้งก่อน</div>
                        <div className="py-0.5 font-bold font-mono">{m['มิเตอร์ครั้งก่อน']}</div>
                      </div>
                      <div className="flex-1 border-r border-slate-300 bg-slate-50">
                        <div className="border-b border-slate-300 py-0.5">ครั้งนี้</div>
                        <div className="py-0.5 font-bold font-mono">{m['มิเตอร์ครั้งนี้']}</div>
                      </div>
                      <div className="flex-1 bg-sky-50">
                        <div className="border-b border-sky-200 py-0.5 font-bold text-sky-800">หน่วย</div>
                        <div className="py-0.5 font-bold text-sky-700">{m['หน่วยที่ใช้']}</div>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-0.5 text-[10px] pr-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">ค่าน้ำประปา</span>
                        <span className="font-bold text-slate-800">{formatCurrency(amount)}</span>
                      </div>
                      {arrears > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">ยอดยกมา</span>
                          <span className="font-bold text-rose-600">{formatCurrency(arrears)}</span>
                        </div>
                      )}
                      {fines > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">ค่าปรับ</span>
                          <span className="font-bold text-amber-600">{formatCurrency(fines)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-800 pt-0.5 mt-1">
                        <span className="font-bold">รวมที่ต้องชำระ</span>
                        <span className="font-bold text-sm text-ocean-700">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="mt-2 text-[8px] text-slate-500 text-center border-t border-dashed border-slate-300 pt-1">
                      กรุณาชำระภายในวันที่ 5 ของเดือน (หากพ้นกำหนดอาจมีค่าปรับ)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">กำลังเตรียมเปิดหน้าพิมพ์...</div>}>
      <PrintContent />
    </Suspense>
  );
}
