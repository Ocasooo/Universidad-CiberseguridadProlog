import type { LogEntry, Alert, Severity, AlertStatus } from '@/types';

const ruleLabels: Record<string, { title: string; description: string }> = {
  admin_fuera_horario: { title: 'Administrador fuera de horario', description: 'Administrador con acceso exitoso fuera del horario laboral (0-7h o 19-23h)' },
  fuerza_bruta: { title: 'Fuerza bruta detectada', description: 'Múltiples intentos fallidos de autenticacion desde el mismo usuario' },
  acceso_malicioso: { title: 'Acceso desde IP maliciosa', description: 'El usuario accedio desde una IP registrada en lista negra' },
  multiples_ips: { title: 'Multiples IPs detectadas', description: 'El usuario realizo accesos exitosos desde distintas direcciones IP' },
  acceso_simultaneo: { title: 'Acceso simultaneo sospechoso', description: 'Mismo usuario accediendo desde distintas subredes' },
  usuario_sospechoso: { title: 'Actividad sospechosa', description: 'El usuario presenta patrones de comportamiento anomalos' },
  evento_critico: { title: 'Evento critico', description: 'Se ha detectado un evento de seguridad critico en el sistema' },
  intrusion_probable: { title: 'Intrusion probable', description: 'Fuerza bruta seguida de acceso exitoso por el mismo usuario' },
  usuario_critico: { title: 'Usuario critico', description: 'Usuario que cumple multiples condiciones de riesgo simultaneamente' },
  ataque_ip: { title: 'Ataque por IP detectado', description: 'IP con multiples intentos fallidos de conexion' },
  multiples_paises: { title: 'Acceso desde multiples paises', description: 'El usuario accedio desde al menos 2 paises distintos' },
  solo_fallos: { title: 'Usuario con solo fallos', description: 'El usuario tiene intentos fallidos y ningun acceso exitoso' },
  ataque_coordinado: { title: 'Ataque coordinado desde pais', description: 'Pais con 5 o mas intentos fallidos de acceso' },
};

export function mapBackendLog(entry: any, index: number): LogEntry {
  const estado = (entry.estado || '').toLowerCase();
  const isFailure = estado === 'fallo';

  return {
    id: `LOG-${String(index + 1).padStart(4, '0')}`,
    timestamp: entry.timestamp || '',
    user: entry.usuario || '',
    ip: entry.ip || '',
    status: isFailure ? 'failure' : estado === 'exito' ? 'success' : 'suspicious',
    severity: isFailure ? 'high' : entry.estado === 'suspicious' ? 'medium' : 'low',
    rule: 'Acceso registrado',
    action: isFailure ? 'Intento fallido' : 'Acceso exitoso',
    port: parseInt(entry.puerto, 10) || 0,
    details: `Puerto: ${entry.puerto || 'N/A'}, Pais: ${entry.pais || 'N/A'}`,
  };
}

export function mapBackendAlert(entry: any, index: number): Alert {
  const severityMap: Record<string, Severity> = {
    critica: 'critical',
    alta: 'high',
    media: 'medium',
    baja: 'low',
    info: 'info',
  };

  const regla = entry.regla || '';
  const ruleInfo = ruleLabels[regla] || { title: 'Alerta de seguridad', description: 'Alerta generada por el motor Prolog' };

  return {
    id: `ALT-${String(index + 1).padStart(3, '0')}`,
    title: ruleInfo.title,
    description: ruleInfo.description,
    severity: severityMap[entry.severidad] || 'info',
    user: entry.usuario || '',
    ip: entry.ip || '',
    timestamp: entry.timestamp || new Date().toISOString(),
    rule: regla,
    status: 'active' as AlertStatus,
    recommendation: 'Revisar y clasificar la alerta',
  };
}

export function mapBackendResponse(data: any): { logs: LogEntry[]; alerts: Alert[] } {
  const logs: LogEntry[] = (data.logs || []).map((entry: any, i: number) =>
    mapBackendLog(entry, i)
  );

  const alerts: Alert[] = (data.alerts || []).map((entry: any, i: number) =>
    mapBackendAlert(entry, i)
  );

  return { logs, alerts };
}

export { ruleLabels };
