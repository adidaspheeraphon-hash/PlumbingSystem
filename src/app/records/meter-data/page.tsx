"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { apiService, MeterRecord } from "@/lib/api";
import DataTable from "@/components/common/DataTable";
import { TableProperties, Edit2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import EditMeterModal from "@/components/meter/EditMeterModal";

export default function MeterDataPage() {
  const { data: res, mutate } = useSWR("meterRecords", () => apiService.getMeterRecords({ limit: 500 }));
  const records = res?.data || [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MeterRecord | null>(null);

  const handleEditClick = (record: MeterRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    mutate(); // Refresh the datatable
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-lg">
          <TableProperties className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">ข้อมูลมิเตอร์น้ำทั้งหมด</h1>
          <p className="text-xs text-slate-400">ประวัติการบันทึกมิเตอร์น้ำทุกหลังคาเรือน</p>
        </div>
      </div>

      <DataTable 
        data={records}
        searchKey="บ้านเลขที่"
        searchPlaceholder="ค้นหาบ้านเลขที่..."
        columns={[
          { header: "เดือนรอบบิล", accessor: (m) => formatDate(m['เดือนรอบบิล']) },
          { header: "House ID", accessor: "House ID", className: "text-center font-semibold" },
          { header: "บ้านเลขที่", accessor: "บ้านเลขที่", className: "text-center" },
          { header: "มิเตอร์ก่อน", accessor: "มิเตอร์ครั้งก่อน", className: "text-center" },
          { header: "มิเตอร์ใหม่", accessor: "มิเตอร์ครั้งนี้", className: "text-center" },
          { header: "หน่วยที่ใช้", accessor: "หน่วยที่ใช้", className: "text-center font-bold" },
          { 
            header: "สถานะ", 
            accessor: (m) => {
              const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'รอชำระ';
              return (
                <span className={cn(
                  "badge",
                  status === "ชำระแล้ว" ? "bg-success-light" : "bg-warning-light"
                )}>
                  {status}
                </span>
              );
            },
            className: "text-center"
          },
          {
            header: "จัดการ",
            accessor: (m) => {
              const status = m['สถานะชำระ'] || m['สถานะการชำระ'] || 'รอชำระ';
              const isPaid = status === "ชำระแล้ว";
              
              return (
                <div className="flex items-center justify-center gap-1.5">
                  <button 
                    onClick={() => !isPaid && handleEditClick(m)}
                    disabled={isPaid}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                      isPaid 
                        ? "text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-60" 
                        : "text-ocean-700 bg-ocean-50 hover:bg-ocean-100 border-ocean-200"
                    )}
                    title={isPaid ? "ไม่สามารถแก้ไขรายการที่ชำระเงินแล้วได้" : "แก้ไขข้อมูล"}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>
                </div>
              );
            },
            className: "text-center w-24"
          }
        ]}
      />

      <EditMeterModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedRecord}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
