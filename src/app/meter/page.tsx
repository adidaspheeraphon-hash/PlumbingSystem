"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { apiService } from "@/lib/api";
import { Gauge, Save, RotateCcw, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { validateMeterReading, validateTextLength, validateBillingMonth } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MeterPage() {
  const { data: initialRes } = useSWR("initialData", () => apiService.getInitialData());
  const houses = initialRes?.data?.houses || [];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    houseId: "",
    prev: "",
    curr: "",
    recorder: "",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastReadLoading, setLastReadLoading] = useState(false);
  const [errorObj, setErrorObj] = useState<{ type: "error" | "warning"; message: string } | null>(null);

  const handleHouseChange = async (houseId: string) => {
    setFormData(prev => ({ ...prev, houseId, prev: "" }));
    if (!houseId) return;

    setLastReadLoading(true);
    try {
      // Find in local data first (if available)
      const localMeters = initialRes?.data?.meters || [];
      const houseMeters = localMeters.filter(m => m['House ID'] === houseId);
      if (houseMeters.length > 0) {
        const lastReading = houseMeters[0]['มิเตอร์ครั้งนี้'] || "0";
        setFormData(prev => ({ ...prev, prev: lastReading }));
      } else {
        // Fallback to API if not in initial meters (which might only be last 50)
        // Note: For now we'll just use what we have or set 0 if not found
        // in a real app, we'd have a specific endpoint for last reading
        setFormData(prev => ({ ...prev, prev: "0" }));
      }
    } finally {
      setLastReadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorObj(null);

    // Manual overall checks
    if (!formData.houseId) {
      setErrorObj({ type: "error", message: "กรุณาเลือกรหัส/บ้านเลขที่" });
      return;
    }
    if (!formData.recorder) {
      setErrorObj({ type: "error", message: "กรุณาระบุชื่อผู้จด" });
      return;
    }

    // Call Centralized Validations
    const dateCheck = validateBillingMonth(formData.date);
    if (!dateCheck.isValid) return setErrorObj({ type: "error", message: dateCheck.error! });

    const recorderCheck = validateTextLength(formData.recorder, 50, "ชื่อผู้จด");
    if (!recorderCheck.isValid) return setErrorObj({ type: "error", message: recorderCheck.error! });

    if (formData.note) {
      const noteCheck = validateTextLength(formData.note, 200, "หมายเหตุ");
      if (!noteCheck.isValid) return setErrorObj({ type: "error", message: noteCheck.error! });
    }

    const meterCheck = validateMeterReading(formData.curr, formData.prev || "0");
    if (!meterCheck.isValid) {
      return setErrorObj({ type: "error", message: meterCheck.error! });
    }

    // If there is an anomaly warning and the user hasn't seen it yet
    if (meterCheck.warning && errorObj?.message !== meterCheck.warning) {
      setErrorObj({ type: "warning", message: meterCheck.warning });
      // We block submission here and wait for them to click Save again to bypass
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.addMeterRecord({
        'House ID': formData.houseId,
        'วันที่จด': formData.date,
        'มิเตอร์ครั้งนี้': formData.curr,
        'ผู้จด': formData.recorder,
        'หมายเหตุ': formData.note,
      });

      if (res.success) {
        alert("บันทึกข้อมูลสำเร็จ!");
        setFormData(prev => ({
          ...prev,
          houseId: "",
          prev: "",
          curr: "",
          note: "",
        }));
        setErrorObj(null);
      } else {
        setErrorObj({ type: "error", message: "เกิดข้อผิดพลาด: " + res.message });
      }
    } catch {
      setErrorObj({ type: "error", message: "ไม่สามารถเชื่อมต่อระบบได้" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 md:p-10"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-ocean-500 to-ocean-700">
            <Gauge className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">บันทึกมิเตอร์น้ำประจำเดือน</h2>
        </div>

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
                  * หากตรวจสอบแล้วว่าถูกต้อง สามารถกดปุ่ม บันทึกข้อมูล อีกครั้งเพื่อยืนยัน
                </p>
              )}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">วันที่จดมิเตอร์</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-ocean-400 outline-none transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">รหัส/บ้านเลขที่ <span className="text-red-500">*</span></label>
              <select 
                value={formData.houseId}
                onChange={e => handleHouseChange(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-ocean-400 outline-none transition-all"
                required
              >
                <option value="">-- เลือกบ้าน --</option>
                {houses.map(h => (
                  <option key={h['House ID']} value={h['House ID']}>
                    {h['House ID']} - บ้านเลขที่ {h['บ้านเลขที่']} ({h['ชื่อเจ้าของ']})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">เลขมิเตอร์ครั้งก่อน</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.prev}
                  placeholder="0"
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium outline-none"
                />
                {lastReadLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-ocean-500" />}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">เลขมิเตอร์ครั้งนี้ <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                inputMode="numeric"
                value={formData.curr}
                onChange={e => setFormData(p => ({ ...p, curr: e.target.value.replace(/\D/g, "") }))}
                placeholder="ระบุเลขหน้าปัด"
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-ocean-400 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">ชื่อผู้จด <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.recorder}
              onChange={e => setFormData(p => ({ ...p, recorder: e.target.value }))}
              placeholder="ชื่อเจ้าหน้าที่"
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-ocean-400 outline-none transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">หมายเหตุ</label>
            <textarea 
              value={formData.note}
              onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
              rows={2}
              placeholder="ถ้ามี.."
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-ocean-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => {
                setFormData({ ...formData, houseId: "", prev: "", curr: "", note: "" });
                setErrorObj(null);
              }}
              className="px-6 py-2.5 rounded-xl border border-ocean-300 text-ocean-700 font-semibold text-sm bg-white hover:bg-ocean-50 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              ล้างฟอร์ม
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg bg-gradient-to-r from-ocean-500 to-ocean-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
