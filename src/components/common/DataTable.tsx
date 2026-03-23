"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  searchKey?: keyof T;
}

export default function DataTable<T>({ 
  data, 
  columns, 
  pageSize = 10, 
  searchPlaceholder = "ค้นหา...",
  searchKey
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredData = React.useMemo(() => {
    if (!search || !searchKey) return data;
    return data.filter(item => {
      const val = item[searchKey];
      return String(val).toLowerCase().includes(search.toLowerCase());
    });
  }, [data, search, searchKey]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex flex-wrap justify-between items-center gap-4 px-8 pt-7 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-ocean-500 to-ocean-700">
            <SearchIcon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">ข้อมูลทั้งหมด</h2>
        </div>
        {searchKey && (
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-slate-800 text-sm focus:ring-2 focus:ring-ocean-400 outline-none transition-all w-64"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-xs text-slate-400 uppercase font-semibold tracking-wide border-b border-slate-50">
              <th className="px-6 py-4 text-center w-16">ลำดับ</th>
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-6 py-4", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-center font-semibold text-slate-500">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={cn("px-6 py-4", col.className)}>
                      {typeof col.accessor === "function" 
                        ? col.accessor(item) 
                        : (item[col.accessor] as React.ReactNode)
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-10 text-slate-400">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-8 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex-wrap gap-3">
        <span className="text-sm text-slate-500">
          แสดง {(page - 1) * pageSize + 1} ถึง {Math.min(page * pageSize, filteredData.length)} จาก {filteredData.length} รายการ
        </span>
        <div className="flex gap-1">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-2.5 py-1 min-w-[32px] rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pNum = i + 1;
              if (pNum === 1 || pNum === totalPages || (pNum >= page - 1 && pNum <= page + 1)) {
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={cn(
                      "px-2.5 py-1 min-w-[32px] rounded-lg border text-sm font-medium transition-all",
                      page === pNum 
                        ? "bg-ocean-50 text-ocean-700 border-ocean-200 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {pNum}
                  </button>
                );
              }
              if (pNum === page - 2 || pNum === page + 2) {
                return <span key={pNum} className="px-1 text-slate-400">...</span>;
              }
              return null;
            })}
          </div>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-2.5 py-1 min-w-[32px] rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
