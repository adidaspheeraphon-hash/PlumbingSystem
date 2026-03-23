"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { MeterRecord } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MeterRecord | null;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, record, onSuccess }: PaymentModalProps) {
  const [paymentDate, setPaymentDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && record) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setPaymentDate(`${yyyy}-${mm}-${dd}`);

      setNote("");
      setErrorMsg(null);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const amountToPay = record['ยอดรวมที่ต้องชำระ'] || record['รวมเงิน'] || '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!paymentDate) {
      return setErrorMsg("กรุณาระบุวันที่รับชำระ");
    }

    try {
      setIsSubmitting(true);

      const payload: Record<string, string | number> = {
        'House ID': record['House ID'],
        'เดือนรอบบิล': record['เดือนรอบบิล'],
        'มิเตอร์ครั้งก่อน': record['มิเตอร์ครั้งก่อน'],
        'มิเตอร์ครั้งนี้': record['มิเตอร์ครั้งนี้'],
        'หน่วยที่ใช้': record['หน่วยที่ใช้'],
        'รวมเงิน': record['รวมเงิน'],
        'สถานะชำระ': 'ชำระแล้ว',
        'สถานะการชำระ': 'ชำระแล้ว',
        'วันที่ชำระ': paymentDate
      };

      if (note) payload['หมายเหตุ'] = note;
      if (record['ยอดรวมที่ต้องชำระ']) payload['ยอดรวมที่ต้องชำระ'] = record['ยอดรวมที่ต้องชำระ'];
      if (record['บ้านเลขที่']) payload['บ้านเลขที่'] = record['บ้านเลขที่'];
      if (record['ผู้จด']) payload['ผู้จด'] = record['ผู้จด'];

      const res = await apiService.updateMeterRecord(payload);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err: unknown) {
      const errorObjMsg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      setErrorMsg(errorObjMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">ยืนยันการรับชำระเงิน</h2>
              <p className="text-sm text-slate-500">บ้านเลขที่ {record['บ้านเลขที่']} (รอบบิล {formatDate(record['เดือนรอบบิล'])})</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl flex items-start gap-3 border bg-red-50 border-red-100"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{errorMsg}</p>
                </div>
              </motion.div>
            )}

            <div className="bg-ocean-50 border border-ocean-100 rounded-xl p-4 mb-6 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-ocean-700 mb-1">ยอดรวมที่ต้องชำระ</span>
              <span className="text-3xl font-bold text-ocean-600">{formatCurrency(amountToPay)}</span>
              <span className="text-xs text-ocean-500 mt-1">บาท</span>
            </div>

            <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">วันที่รับชำระ <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">หมายเหตุ (ผู้รับเงิน/สลิป)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all"
                  placeholder="เช่น โอนเงินเข้าบัญชี..."
                />
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="payment-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-ocean-500 to-ocean-700 hover:from-ocean-600 hover:to-ocean-800 shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              ยืนยันการรับชำระ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
