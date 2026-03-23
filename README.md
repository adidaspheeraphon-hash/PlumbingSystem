# 💧 ระบบจัดการน้ำประปา (PlumbingSystem)

ระบบจัดการน้ำประปาหมู่บ้าน พัฒนาด้วย **Next.js 15** รองรับการบันทึกมิเตอร์ ออกใบแจ้งหนี้ รับชำระเงิน และพิมพ์ใบเสร็จออนไลน์

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Private-red)

---

## ✨ ฟีเจอร์หลัก

| โมดูล | รายละเอียด |
|-------|-----------|
| 📊 **แดชบอร์ด** | ภาพรวมสถิติ ยอดค้างชำระ จำนวนบ้าน |
| 📍 **บันทึกมิเตอร์** | บันทึกค่ามิเตอร์น้ำรายเดือน พร้อม Validation ตรวจจับค่าผิดปกติ |
| 🧾 **ใบแจ้งหนี้** | ดูรายการค้างชำระ กรองตามรอบบิล/สถานะ รับชำระ พิมพ์ใบแจ้งหนี้ |
| 🧾 **ใบเสร็จรับเงิน** | ดูประวัติการชำระ พิมพ์ใบเสร็จ A4 |
| 🔍 **ค้นหา** | ค้นหาข้อมูลการใช้น้ำย้อนหลัง |
| 📁 **ข้อมูลทะเบียนบ้าน** | จัดการข้อมูลบ้านและเจ้าของ |
| 📈 **รายงาน** | สรุปรายงานการใช้น้ำและรายรับ |
| ⚙️ **ตั้งค่า** | กำหนดอัตราค่าน้ำ, API URL |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3, Custom CSS Design System
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Data Fetching:** SWR
- **Backend:** Google Sheets API (ผ่าน Google Apps Script)

---

## 🚀 การติดตั้ง

### ความต้องการของระบบ
- Node.js 18+
- npm หรือ yarn

### ขั้นตอน

```bash
# 1. Clone repository
git clone https://github.com/adidaspheeraphon-hash/PlumbingSystem.git
cd PlumbingSystem

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า Environment (ถ้ามี)
# แก้ไข API URL ได้ที่หน้า Settings ในแอป

# 4. รันโปรเจกต์
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 📂 โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx                  # แดชบอร์ด
│   ├── meter/                    # บันทึกมิเตอร์
│   ├── billing/
│   │   ├── invoices/             # ใบแจ้งหนี้
│   │   └── receipts/             # ใบเสร็จรับเงิน
│   ├── records/
│   │   ├── houses/               # ทะเบียนบ้าน
│   │   └── meter-data/           # ข้อมูลมิเตอร์
│   ├── report/                   # รายงาน
│   ├── search/                   # ค้นหา
│   └── settings/                 # ตั้งค่า
├── components/
│   ├── layout/                   # Layout, Navbar, BottomNav
│   ├── common/                   # DataTable, SearchBar
│   ├── dashboard/                # StatCard
│   ├── billing/                  # ReceiptDetailModal
│   └── meter/                    # PaymentModal, EditMeterModal
└── lib/
    ├── api.ts                    # API Service (Google Sheets)
    ├── utils.ts                  # Utility functions
    └── validations.ts            # Input validation
```

---

## 📜 คำสั่งที่ใช้บ่อย

```bash
npm run dev      # รัน development server
npm run build    # Build สำหรับ production
npm run start    # รัน production server
npm run lint     # ตรวจสอบ ESLint
```

---

## 🖨️ ฟีเจอร์พิมพ์เอกสาร

- **ใบแจ้งหนี้:** พิมพ์รายบ้าน หรือพิมพ์ทั้งหมดตามรอบบิล (8 รายการ/หน้า A4)
- **ใบเสร็จรับเงิน:** พิมพ์ใบเสร็จแบบ A4 พร้อมข้อมูลการชำระ

---

## 👤 ผู้พัฒนา

พัฒนาสำหรับระบบจัดการน้ำประปาหมู่บ้าน  
GitHub: [@adidaspheeraphon-hash](https://github.com/adidaspheeraphon-hash)
