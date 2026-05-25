import { StatsCardData, ActivityByHour, ThreatDistribution } from "@/types";

export const mockStatsCards: StatsCardData[] = [
  {
    title: "Logs Procesados",
    value: 12847,
    trend: 12.5,
    icon: "FileText",
    suffix: "total",
  },
  {
    title: "Alertas Críticas",
    value: 23,
    trend: 8.3,
    icon: "ShieldAlert",
    suffix: "activas",
  },
  {
    title: "IPs Bloqueadas",
    value: 156,
    trend: -3.2,
    icon: "Ban",
    suffix: "bloqueadas",
  },
  {
    title: "Intentos de Intrusión",
    value: 892,
    trend: 15.7,
    icon: "Swords",
    suffix: "detectados",
  },
];

export const mockActivityByHour: ActivityByHour[] = [
  { hour: "00:00", events: 42, alerts: 3 },
  { hour: "02:00", events: 38, alerts: 2 },
  { hour: "04:00", events: 45, alerts: 5 },
  { hour: "06:00", events: 89, alerts: 8 },
  { hour: "08:00", events: 234, alerts: 25 },
  { hour: "10:00", events: 356, alerts: 32 },
  { hour: "12:00", events: 278, alerts: 28 },
  { hour: "14:00", events: 312, alerts: 30 },
  { hour: "16:00", events: 289, alerts: 22 },
  { hour: "18:00", events: 198, alerts: 18 },
  { hour: "20:00", events: 134, alerts: 12 },
  { hour: "22:00", events: 78, alerts: 6 },
];

export const mockThreatDistribution: ThreatDistribution[] = [
  { name: "Fuerza Bruta", value: 35, color: "#ef4444" },
  { name: "Malware", value: 20, color: "#f97316" },
  { name: "Phishing", value: 15, color: "#eab308" },
  { name: "DDoS", value: 12, color: "#22c55e" },
  { name: "SQL Injection", value: 10, color: "#3b82f6" },
  { name: "Otros", value: 8, color: "#8b5cf6" },
];

export const mockSeverityDistribution = [
  { name: "Crítico", value: 8, color: "#ef4444" },
  { name: "Alto", value: 15, color: "#f97316" },
  { name: "Medio", value: 32, color: "#eab308" },
  { name: "Bajo", value: 28, color: "#22c55e" },
  { name: "Info", value: 17, color: "#3b82f6" },
];

export const mockAttackTypes = [
  { name: "Autenticación", value: 45, color: "#ef4444" },
  { name: "Red", value: 25, color: "#f97316" },
  { name: "Aplicación", value: 18, color: "#eab308" },
  { name: "Sistema", value: 12, color: "#22c55e" },
];
