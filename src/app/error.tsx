"use client";

import React from "react";
import { AlertCircle, Terminal, CheckCircle2 } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6 shadow-sm border border-red-100">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">เกิดข้อผิดพลาดรันไทม์</h2>
      <p className="text-slate-500 mb-8 max-w-md">ระบบพบปัญหาบางประการในการประมวลผลข้อมูล โปรดลองใหม่อีกครั้งหรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</p>
      
      <div className="w-full max-w-lg bg-slate-900 rounded-xl p-4 text-left overflow-x-auto mb-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Debug Info</span>
        </div>
        <code className="text-xs text-rose-400 block font-mono">
          {error.message || "Unknown error occurred"}
        </code>
        {error.digest && (
          <div className="mt-2 text-[10px] text-slate-600 font-mono">
            Digest: {error.digest}
          </div>
        )}
      </div>

      <button
        onClick={reset}
        className="px-8 py-3 rounded-xl bg-ocean-600 text-white font-bold hover:bg-ocean-700 transition-all shadow-lg flex items-center gap-2"
      >
        <CheckCircle2 className="w-5 h-5" />
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}
