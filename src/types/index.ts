export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type LogStatus = 'success' | 'failure' | 'suspicious';
export type AlertStatus = 'active' | 'investigating' | 'resolved';
export type ReportStatus = 'generated' | 'pending' | 'error';
export type BlacklistStatus = 'active' | 'inactive';
export type PrologStatus = 'connected' | 'disconnected' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  ip: string;
  status: LogStatus;
  severity: Severity;
  rule: string;
  action: string;
  source?: string;
  destination?: string;
  protocol?: string;
  port?: number;
  details?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  user: string;
  ip: string;
  timestamp: string;
  rule: string;
  status: AlertStatus;
  recommendation: string;
  source?: string;
  attempts?: number;
  subred?: string;
  history?: { timestamp: string; event: string }[];
  classification?: 'seguro' | 'peligro';
}

export interface StatsCardData {
  title: string;
  value: number;
  trend: number;
  icon: string;
  prefix?: string;
  suffix?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
  color?: string;
}

export interface ActivityByHour {
  hour: string;
  events: number;
  alerts: number;
}

export interface ThreatDistribution {
  name: string;
  value: number;
  color: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  threatsDetected: number;
  status: ReportStatus;
  generatedBy: string;
  summary: string;
}

export interface BlacklistEntry {
  id: string;
  ip: string;
  reason: string;
  date: string;
  status: BlacklistStatus;
  blockedBy: string;
  attempts: number;
  source: string;
}

export interface PrologRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  condition: string;
  action: string;
  active: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}
