
import { ChoirData, AttendanceTrend } from './types';

export const CHOIR_DATA: ChoirData[] = [
  { id: '1', name: 'Bicentenario', initials: 'BI', attendance: 95.5, streak: 8, status: 'Activo' },
  { id: '2', name: 'Bucerias', initials: 'BU', attendance: 92.1, streak: 5, status: 'Activo' },
  { id: '3', name: 'El Guamuchil', initials: 'EG', attendance: 88.4, streak: 3, status: 'Revisión' },
  { id: '4', name: 'El Porvenir', initials: 'EP', attendance: 94.2, streak: 10, status: 'Activo' },
  { id: '5', name: 'La Peñita', initials: 'LP', attendance: 85.0, streak: 2, status: 'Revisión' },
  { id: '6', name: 'Mezcales', initials: 'ME', attendance: 97.8, streak: 15, status: 'Activo' },
  { id: '7', name: 'Mezcalitos', initials: 'MT', attendance: 91.0, streak: 4, status: 'Activo' },
  { id: '8', name: 'Monte Sinai', initials: 'MS', attendance: 93.4, streak: 7, status: 'Activo' },
  { id: '9', name: 'Punta de Mita', initials: 'PM', attendance: 89.9, streak: 6, status: 'Activo' },
  { id: '10', name: 'San Ignacio', initials: 'SI', attendance: 96.2, streak: 12, status: 'Activo' },
  { id: '11', name: 'San Jose', initials: 'SJ', attendance: 94.5, streak: 9, status: 'Activo' },
];

export const ATTENDANCE_TRENDS: AttendanceTrend[] = [
  { month: 'ENE', value: 240 },
  { month: 'FEB', value: 310 },
  { month: 'MAR', value: 290 },
  { month: 'ABR', value: 350 },
  { month: 'MAY', value: 420 },
  { month: 'JUN', value: 480 },
];

export const CALENDAR_DAYS = [
  { day: 1, type: 'normal' }, { day: 2, type: 'normal' }, { day: 3, type: 'normal' },
  { day: 4, type: 'normal' }, { day: 5, type: 'active' }, { day: 6, type: 'normal' },
];
