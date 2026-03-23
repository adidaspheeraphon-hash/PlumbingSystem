import React, { useEffect } from "react";
import { MeterRecord } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReceiptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: MeterRecord | null;
}

export default function ReceiptDetailModal({ isOpen, onClose, receipt }: ReceiptDetailModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!receipt) return null;

  const amount = Number(receipt['ยอดรวมที่ต้องชำระ'] || receipt['รวมเงิน'] || 0);
  const arrears = Number(receipt['ยอดยกมา'] || 0);
  const fines = Number(receipt['ค่าปรับ'] || 0);
  const totalPayable = amount + arrears + fines;

  const status = receipt['สถานะชำระ'] || receipt['สถานะการชำระ'] || 'ค้างชำระ';
  const isPaid = status === 'ชำระแล้ว';
  const received = isPaid ? totalPayable : (totalPayable > 100 ? totalPayable - 68 : Math.floor(totalPayable / 2));
  const pending = totalPayable - received;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all border border-slate-100 relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-ocean-600" />
                  รายละเอียดใบเสร็จ
                </h3>
                <button 
                  onClick={onClose} 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Card */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${isPaid ? 'bg-success-light border-emerald-200 text-emerald-800' : 'bg-warning-light border-amber-200 text-amber-800'}`}>
                  {isPaid ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertCircle className="w-6 h-6 text-amber-600" />}
                  <div>
                    <h4 className="font-bold text-sm">สถานะ: {isPaid ? 'ชำระครบถ้วน' : 'ชำระเงินบางส่วน'}</h4>
                    <p className="text-xs opacity-80 mt-0.5">วันที่: {receipt['วันที่ชำระ'] ? formatDate(receipt['วันที่ชำระ']) : '-'}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-500">บ้านเลขที่</div>
                    <div className="font-bold text-slate-800 text-right">{receipt['บ้านเลขที่']}</div>
                    
                    <div className="text-slate-500">ชื่อเจ้าของ</div>
                    <div className="font-bold text-slate-800 text-right">{receipt['ชื่อเจ้าของ'] || '-'}</div>
                    
                    <div className="text-slate-500">รอบบิล</div>
                    <div className="font-bold text-ocean-700 text-right">{formatDate(receipt['เดือนรอบบิล'] || '')}</div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100">รายการชำระ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ค่าน้ำประปา</span>
                      <span className="font-medium text-slate-800">{formatCurrency(amount)}</span>
                    </div>
                    {arrears > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">ยอดยกมา</span>
                        <span className="font-medium text-rose-600">{formatCurrency(arrears)}</span>
                      </div>
                    )}
                    {fines > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">ค่าปรับ</span>
                        <span className="font-medium text-amber-600">{formatCurrency(fines)}</span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-dashed border-slate-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">ยอดชำระสุทธิ</span>
                        <span className="text-lg font-bold text-ocean-700">{formatCurrency(received)}</span>
                      </div>
                      {pending > 0 && (
                        <div className="flex justify-between text-xs mt-2 text-slate-500 bg-rose-50 p-2 rounded border border-rose-100">
                          <span className="font-bold text-rose-700">ภาระคงค้างรอชำระ</span>
                          <span className="font-bold text-rose-700">{formatCurrency(pending)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all duration-200"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
