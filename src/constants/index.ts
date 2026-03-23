export const APP_CONFIG = {
  NAME: "ระบบประปาหมู่บ้าน",
  VERSION: "0.1.0",
};

export const API_ACTIONS = {
  GET_INITIAL_DATA: 'getInitialData',
  GET_METERS: 'getMeters',
  GET_HOUSES: 'getHouses',
  GET_DASHBOARD: 'getDashboard',
  GET_LAST_METER_READING: 'getLastMeterReading',
  ADD_METER_READING: 'addMeterReading',
  UPDATE_METER_READING: 'updateMeterReading',
  DELETE_METER_READING: 'deleteMeterReading',
};

export const PAYMENT_STATUS = {
  ALL: "ทั้งหมด",
  PAID: "ชำระแล้ว",
  PENDING: "ค้างชำระ",
  PARTIAL: "ชำระบางส่วน",
};
