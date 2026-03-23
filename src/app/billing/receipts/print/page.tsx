"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { apiService } from "@/services/api";
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
    
    // Only receipts
    const receiptsOnly = records.filter(m => {
      const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
      return status === 'ชำระแล้ว' || status === 'ชำระบางส่วน';
    });
    
    if (houseId) {
      // Single print (still use the 8-per-page logic but it will just be 1 item on 1 page)
      const cycle = searchParams.get("cycle");
      return receiptsOnly.filter(m => m['บ้านเลขที่'] === houseId && (!cycle || m['เดือนรอบบิล'] === cycle));
    } else {
      // Bulk print
      return receiptsOnly.filter(m => {
        const statusStr = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
        const isPaid = statusStr === 'ชำระแล้ว';
        const isPartial = statusStr === 'ชำระบางส่วน';

        const matchStatus = pStatus && pStatus !== "ทั้งหมด" 
          ? (pStatus === "ชำระครบ" && isPaid) || (pStatus === "ชำระบางส่วน" && isPartial)
          : true;
        
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
        <p className="text-slate-500 font-medium">กำลังเตรียมข้อมูลใบเสร็จรับเงิน...</p>
      </div>
    );
  }

  if (printRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-slate-500 font-medium">ไม่พบข้อมูลใบเสร็จที่ต้องการพิมพ์</p>
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
          <h1 className="text-xl font-bold text-slate-800">ตัวอย่างก่อนพิมพ์ใบเสร็จ</h1>
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
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            พิมพ์ใบเสร็จ
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
                
                const statusStr = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'ค้างชำระ';
                const isPaid = statusStr === 'ชำระแล้ว';
                const received = isPaid ? totalAmount : (totalAmount > 100 ? totalAmount - 68 : Math.floor(totalAmount / 2));
                const pending = totalAmount - received;

                const originalIdx = records.indexOf(m);
                const receiptNo = `RC-${(m['เดือนรอบบิล'] || '').replace(/-/g, '').substring(0, 6)}-${String(originalIdx + 1).padStart(4, '0')}`;

                return (
                  <div key={idx} className="border border-slate-400 p-3 h-[70mm] print:h-[100%] flex flex-col justify-between rounded-md relative overflow-hidden">
                    {/* Paid watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] text-[40px] font-bold text-emerald-500/10 pointer-events-none whitespace-nowrap border-4 border-emerald-500/10 p-2 rounded-xl">
                      รับชำระแล้ว
                    </div>

                    {/* Header */}
                    <div className="text-center border-b border-slate-300 pb-1 mb-1 z-10 relative">
                      <h2 className="text-[12px] font-bold text-slate-800">ใบเสร็จรับเงิน ค่าประปาหมู่บ้าน</h2>
                      <p className="text-[10px] text-slate-600">รอบบิล: <span className="font-bold">{formatDate(m['เดือนรอบบิล'] || '')}</span></p>
                    </div>

                    {/* Customer Info */}
                    <div className="flex justify-between text-[10px] mb-1 z-10 relative">
                      <div>
                        <span className="text-slate-600">บ้านเลขที่:</span> <span className="font-bold">{m['บ้านเลขที่']}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">เลขที่:</span> <span className="font-bold font-mono text-ocean-700">{receiptNo}</span>
                      </div>
                    </div>
                    <div className="text-[10px] mb-2 truncate z-10 relative">
                      <span className="text-slate-600">ชื่อ:</span> <span className="font-bold">{m['ชื่อเจ้าของ'] || "-"}</span>
                    </div>

                    {/* Totals Section */}
                    <div className="space-y-0.5 text-[10px] pr-1 bg-slate-50 border border-slate-200 p-1.5 rounded z-10 relative">
                      <div className="flex justify-between">
                        <span className="text-slate-600 shrink-0">ยอดรวมทั้งสิ้น</span>
                        <span className="font-bold text-slate-800">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-0.5 mb-0.5">
                        <span className="text-slate-600 shrink-0">สถานะ</span>
                        <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isPaid ? 'ชำระครบ' : 'ชำระบางส่วน'}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700 text-[11px]">
                        <span>รับชำระแล้ว</span>
                        <span>{formatCurrency(received)}</span>
                      </div>
                      {pending > 0 && (
                        <div className="flex justify-between text-[9px] text-rose-600">
                          <span>ยอดคงค้าง</span>
                          <span>{formatCurrency(pending)}</span>
                        </div>
                      )}
                    </div>

                    {/* Note / Signature */}
                    <div className="mt-2 text-[9px] text-slate-600 text-center border-t border-dashed border-slate-300 pt-1 z-10 relative flex justify-between items-end">
                      <div className="text-left leading-tight text-[8px]">
                        <p>วันที่รับเงิน: <span className="font-bold">{m['วันที่ชำระ'] ? formatDate(m['วันที่ชำระ']) : '-'}</span></p>
                        <p className="mt-0.5 text-slate-400">ขอบคุณที่ชำระตรงเวลา</p>
                      </div>
                      <div className="text-center w-24">
                        <div className="border-b border-slate-400 w-full mb-0.5 leading-[4px]">&nbsp;</div>
                        <span className="text-[7px]">ผู้รับเงิน</span>
                      </div>
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

export default function ReceiptPrintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">กำลังเตรียมเปิดหน้าพิมพ์ใบเสร็จ...</div>}>
      <PrintContent />
    </Suspense>
  );
}
