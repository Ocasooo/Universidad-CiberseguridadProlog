import type { LogEntry, Alert, ActivityByHour, ThreatDistribution } from '@/types';

export function computeActivityByHour(logs: LogEntry[]): ActivityByHour[] {
  const buckets: Record<string, { events: number; alerts: number }> = {};

  for (const log of logs) {
    const hour = log.timestamp ? log.timestamp.slice(11, 13) + ':00' : '00:00';
    if (!buckets[hour]) buckets[hour] = { events: 0, alerts: 0 };
    buckets[hour].events++;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, data]) => ({ hour, ...data }));
}

export function computeSeverityDistribution(logs: LogEntry[]) {
  const counts: Record<string, number> = {};
  const colors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    info: '#3b82f6',
  };

  for (const log of logs) {
    counts[log.severity] = (counts[log.severity] || 0) + 1;
  }

  return Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: colors[name] || '#8b5cf6',
  }));
}

export function computeAttackTypes(logs: LogEntry[]) {
  const counts: Record<string, number> = {};
  const colors: Record<string, string> = {
    'Fuerza Bruta': '#ef4444',
    'Escaneo': '#f97316',
    'Acceso no autorizado': '#eab308',
    'Malware': '#22c55e',
    'Phishing': '#3b82f6',
    'DDoS': '#8b5cf6',
    'SQL Injection': '#ec4899',
  };

  for (const log of logs) {
    const action = log.action || 'Otros';
    counts[action] = (counts[action] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#6b7280',
    }));
}

export function computeThreatDistribution(alerts: Alert[]): ThreatDistribution[] {
  const counts: Record<string, number> = {};
  const colors: Record<string, string> = {
    'Fuerza bruta detectada': '#ef4444',
    'Intrusion probable': '#f97316',
    'Administrador fuera de horario': '#eab308',
    'Acceso desde IP blacklist': '#22c55e',
    'Acceso simultaneo sospechoso': '#3b82f6',
    'Acceso desde multiples paises': '#8b5cf6',
    'Usuario con solo fallos': '#ec4899',
    'Ataque coordinado desde pais': '#06b6d4',
    'Acceso desde IP maliciosa': '#14b8a6',
    'Multiples IPs detectadas': '#f43f5e',
    'Actividad sospechosa': '#a855f7',
    'Evento critico': '#84cc16',
    'Usuario critico': '#0ea5e9',
    'Ataque por IP detectado': '#d946ef',
  };

  for (const alert of alerts) {
    const title = alert.title || 'Otros';
    counts[title] = (counts[title] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#8b5cf6',
    }));
}
