"use client";

import React from "react";
import useSWR from "swr";
import { apiService } from "@/services/api";
import DataTable from "@/components/common/DataTable";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function HousesPage() {
  const { data: res } = useSWR("initialData", () => apiService.getInitialData());
  const houses = res?.data?.houses || [];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-lg">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">ข้อมูลลูกบ้าน</h1>
          <p className="text-xs text-slate-400">จัดการข้อมูลและสถานะการใช้งานของสมาชิกที่อาศัย</p>
        </div>
      </motion.div>
 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DataTable 
          data={houses}
          searchKey="บ้านเลขที่"
          searchPlaceholder="ค้นหาบ้านเลขที่..."
          columns={[
            { header: "House ID", accessor: "House ID", className: "text-center font-semibold" },
            { header: "บ้านเลขที่", accessor: "บ้านเลขที่", className: "text-center" },
            { header: "ชื่อเจ้าของ", accessor: "ชื่อเจ้าของ" },
            { header: "เลขมิเตอร์", accessor: "เลขมิเตอร์" },
            { 
              header: "สถานะ", 
              accessor: (h) => (
                <span className={cn(
                  "badge",
                  h['สถานะ'] === "ใช้งาน" ? "bg-success-light" : "bg-warning-light"
                )}>
                  {h['สถานะ'] || "ใช้งาน"}
                </span>
              ),
              className: "text-center"
            },
          ]}
        />
      </motion.div>
    </div>
  );
}
