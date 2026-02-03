
export enum Role {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR'
}

export enum ViewType {
  DASHBOARD = 'dashboard',
  CHORUSES = 'choruses',
  REPORTS = 'reports',
  EVENTS = 'events',
  EVENT_DETAILS = 'event_details',
  ANALYTICS = 'analytics',
  USER_MANAGEMENT = 'user_management',
  RAW_DATA = 'raw_data',
  MEMBER_PROFILE = 'member_profile'
}

export enum TimeFilter {
  TODAY = 'hoy',
  WEEK = 'semana',
  MONTH = 'mes'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  choirId?: string;
  avatar?: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  choirId: string;
  voiceType: 'Soprano' | 'Contralto' | 'Tenor' | 'Bajo' | 'Por asignar';
  gender: 'Hombre' | 'Mujer';
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  memberId: string;
  present: boolean;
  date: string;
}

export interface ChoirData {
  id: string;
  name: string;
  initials: string;
  attendance: number;
  streak: number;
  status: 'Activo' | 'Revisión' | 'Inactivo';
  imageUrl?: string;
}

export interface AttendanceTrend {
  month: string;
  value: number;
}
