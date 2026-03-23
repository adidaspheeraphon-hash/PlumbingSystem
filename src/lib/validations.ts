export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export const validateMeterReading = (
  currentStr: string,
  previousStr: string | number
): ValidationResult => {
  if (!currentStr || currentStr.trim() === "") {
    return { isValid: false, error: "กรุณาระบุเลขมิเตอร์ครั้งนี้" };
  }

  const current = Number(currentStr);
  const previous = Number(previousStr);

  if (isNaN(current)) {
    return { isValid: false, error: "กรุณาระบุเลขมิเตอร์เป็นตัวเลขที่ถูกต้อง" };
  }

  if (current < previous) {
    return {
      isValid: false,
      error: `เลขมิเตอร์ครั้งนี้ (${current}) ไม่สามารถน้อยกว่ามิเตอร์ครั้งก่อน (${previous}) ได้`,
    };
  }

  const usage = current - previous;
  if (usage > 100) {
    return {
      isValid: true,
      warning: `ค่าน้ำงวดนี้สูงผิดปกติ (${usage} หน่วย) กรุณาตรวจสอบว่ากรอกข้อมูลถูกต้องหรือไม่ก่อนบันทึก`,
    };
  }

  return { isValid: true };
};

export const validateTextLength = (
  text: string,
  maxLength: number,
  fieldName: string
): ValidationResult => {
  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} ยาวเกินไป (สูงสุด ${maxLength} ตัวอักษร)`,
    };
  }
  return { isValid: true };
};

export const validateBillingMonth = (dateStr: string): ValidationResult => {
  if (!dateStr) return { isValid: false, error: "กรุณาระบุวันที่จดมิเตอร์" };

  const selectedDate = new Date(dateStr);
  const now = new Date();
  
  // Allow up to 1 month in the future just in case of timezone/early recording limits, but reject extreme futures
  const maxFutureDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  if (selectedDate > maxFutureDate) {
    return { isValid: false, error: "ไม่สามารถเลือกวันที่จดมิเตอร์ล่วงหน้าเกิน 1 เดือนได้" };
  }

  return { isValid: true };
};

export const validateDateRange = (startStr: string, endStr: string): ValidationResult => {
  if (!startStr || !endStr) return { isValid: true }; // Skipped if either is empty

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (end < start) {
    return { isValid: false, error: "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น" };
  }

  return { isValid: true };
};
