const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_GAS_API_URL || 'https://script.google.com/macros/s/AKfycbx4i-nhU0dvt1QCTfjux4A5jKamoCnIY3tGf80pdfprQiCn2EFlwstI2yLDT4U1H2Q/exec',
};

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

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private isConfigured(): boolean {
    return (
      this.baseUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL' &&
      this.baseUrl.startsWith('https://script.google.com/macros/s/')
    );
  }

  async fetchGet<T>(action: string, params: Record<string, string | number> = {}): Promise<ApiResponse<T>> {
    if (!this.isConfigured()) throw new Error('API URL is not configured.');

    const url = new URL(this.baseUrl);
    url.searchParams.set('action', action);
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, String(val));
    }

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error in GET ${action}:`, error);
      throw error;
    }
  }

  async fetchPost<T>(action: string, data: unknown): Promise<ApiResponse<T>> {
    if (!this.isConfigured()) throw new Error('API URL is not configured.');

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error in POST ${action}:`, error);
      throw error;
    }
  }

  async getInitialData() {
    return this.fetchGet<InitialData>('getInitialData');
  }

  async getMeterRecords(params: { limit?: number; offset?: number } = {}) {
    return this.fetchGet<MeterRecord[]>('getMeters', params as Record<string, string | number>);
  }

  async getHouses() {
    return this.fetchGet<House[]>('getHouses');
  }

  async getDashboard() {
    return this.fetchGet<DashboardData>('getDashboard');
  }

  async getMeters(params: { limit?: number; offset?: number } = {}) {
    return this.fetchGet<MeterRecord[]>('getMeters', params as Record<string, string | number>);
  }

  async getLastMeterReading(houseId: string) {
    return this.fetchGet<{ lastReading: number }>('getLastMeterReading', { houseId });
  }

  async addMeterRecord(data: Record<string, string | number>) {
    return this.fetchPost('addMeterReading', data);
  }

  async updateMeterRecord(data: Record<string, string | number>) {
    return this.fetchPost('updateMeterReading', data);
  }

  async deleteMeterRecord(data: Record<string, string | number>) {
    return this.fetchPost('deleteMeterReading', data);
  }
}

export const apiService = new ApiService();
