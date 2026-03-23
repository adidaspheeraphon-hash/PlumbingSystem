"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { MeterRecord, apiService } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { validateMeterReading, validateTextLength } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface EditMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MeterRecord | null;
  onSuccess: () => void;
}

export default function EditMeterModal({ isOpen, onClose, record, onSuccess }: EditMeterModalProps) {
  const [currentMeter, setCurrentMeter] = useState("");
  const [recorder, setRecorder] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorObj, setErrorObj] = useState<{ type: "error" | "warning"; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && record) {
      setCurrentMeter(record['มิเตอร์ครั้งนี้'] || "");
      setRecorder(record['ผู้จด'] || "");
      setNote(record['หมายเหตุ'] || "");
      setErrorObj(null);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const previousMeter = Number(record['มิเตอร์ครั้งก่อน']) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorObj(null);

    const recorderCheck = validateTextLength(recorder, 50, "ชื่อผู้จด");
    if (!recorderCheck.isValid) return setErrorObj({ type: "error", message: recorderCheck.error! });

    if (note) {
      const noteCheck = validateTextLength(note, 200, "หมายเหตุ");
      if (!noteCheck.isValid) return setErrorObj({ type: "error", message: noteCheck.error! });
    }

    const meterCheck = validateMeterReading(currentMeter, previousMeter);
    if (!meterCheck.isValid) {
      return setErrorObj({ type: "error", message: meterCheck.error! });
    }

    if (meterCheck.warning && errorObj?.message !== meterCheck.warning) {
      setErrorObj({ type: "warning", message: meterCheck.warning });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiService.updateMeterRecord({
        'House ID': record['House ID'],
        'เดือนรอบบิล': record['เดือนรอบบิล'],
        'มิเตอร์ครั้งนี้': currentMeter,
        'ผู้จด': recorder,
        'หมายเหตุ': note
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorObj({ type: "error", message: res.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
      }
    } catch (err: unknown) {
      const errorObjMsg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      setErrorObj({ type: "error", message: errorObjMsg });
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
              <h2 className="text-lg font-bold text-slate-800">แก้ไขข้อมูลมิเตอร์น้ำ</h2>
              <p className="text-sm text-slate-500">บ้านเลขที่ {record['บ้านเลขที่']} (House ID: {record['House ID']})</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {errorObj && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mb-6 p-4 rounded-xl flex items-start gap-3 border",
                  errorObj.type === "error" 
                    ? "bg-red-50 border-red-100" 
                    : "bg-amber-50 border-amber-200"
                )}
              >
                {errorObj.type === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    errorObj.type === "error" ? "text-red-700" : "text-amber-800"
                  )}>
                    {errorObj.message}
                  </p>
                  {errorObj.type === "warning" && (
                    <p className="text-xs text-amber-600 mt-1">
                      * หากถูกต้องแล้ว สามารถกดปุ่ม บันทึกข้อมูล อีกครั้งเพื่อยืนยัน
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <form id="edit-meter-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">มิเตอร์ครั้งก่อน</label>
                  <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium">
                    {record['มิเตอร์ครั้งก่อน'] || "0"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">มิเตอร์ครั้งนี้ <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={currentMeter}
                    onChange={(e) => setCurrentMeter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all"
                    placeholder="ระบุเลขมิเตอร์..."
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">ชื่อผู้จด</label>
                <input
                  type="text"
                  value={recorder}
                  onChange={(e) => setRecorder(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all"
                  placeholder="เช่น สมชาย..."
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">หมายเหตุ</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all resize-none"
                  placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
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
              form="edit-meter-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-ocean-500 to-ocean-700 hover:from-ocean-600 hover:to-ocean-800 shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              บันทึกข้อมูล
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
