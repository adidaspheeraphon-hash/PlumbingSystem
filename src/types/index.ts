export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface House {
  'House ID': string;
  'บ้านเลขที่': string;
  'ชื่อเจ้าของ': string;
  'สถานะ': string;
  'เลขมิเตอร์': string;
}

export interface MeterRecord {
  'เดือนรอบบิล': string;
  'House ID': string;
  'บ้านเลขที่': string;
  'ชื่อเจ้าของ'?: string;
  'มิเตอร์ครั้งก่อน': string;
  'มิเตอร์ครั้งนี้': string;
  'หน่วยที่ใช้': string;
  'รวมเงิน': string;
  'สถานะชำระ'?: string;
  'สถานะการชำระ'?: string;
  'ยอดรวมที่ต้องชำระ'?: string;
  'วันที่ชำระ'?: string;
  'ผู้จด'?: string;
  'หมายเหตุ'?: string;
  'ยอดยกมา'?: string | number;
  'ค่าปรับ'?: string | number;
}

export interface DashboardData {
  totalHouses: number;
  totalReadings: number;
}

export interface InitialData {
  config: Record<string, string>[];
  houses: House[];
  dashboard: DashboardData;
  meters: MeterRecord[];
}
