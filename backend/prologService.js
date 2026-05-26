const { exec } = require('child_process');
const path = require('path');

const PROLOG_DIR = path.join(__dirname, 'prolog');
const PROLOG_FILE = path.join(PROLOG_DIR, 'baseConocimientoCiberseguridad.pl');

const SWIPL_PATHS = [
  'C:\\Program Files\\swipl\\bin\\swipl.exe',
  'C:\\swipl\\bin\\swipl.exe',
  '/usr/bin/swipl',
  '/usr/local/bin/swipl',
];

function findSwipl() {
  const fs = require('fs');
  for (const p of SWIPL_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('SWI-Prolog no encontrado en rutas comunes. Instalelo en C:\\Program Files\\swipl');
}

function runGoal(goal, factsFile) {
  return new Promise((resolve, reject) => {
    const swipl = findSwipl(); //encuentra SWI-Prolog
    const source = factsFile && require('fs').existsSync(factsFile) 
      ? `"${factsFile}"`
      : `"${PROLOG_FILE}"`;
    const cleaned = goal.replace(/\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim(); //limpia consulta
                  //swipl -q -s combined.pl -g "consulta" -t "halt(1)"
    const cmd = `"${swipl}" -q -s ${source} -g "${cleaned}" -t "halt(1)"`;//Construye el comando
    //ejecuta el comando
    exec(cmd, { timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && !stdout) {
        const msg = (stderr || err.message || 'Error desconocido').trim();
        return reject(new Error('Error al ejecutar Prolog: ' + msg));
      }
      if (stderr) {
        console.error('Prolog STDERR:', stderr.trim());
      }
      resolve(stdout);
    });
  });
}

//extraer una seccion especifica
function parseSection(output, marker) {
  const lines = output.split('\n').map(l => l.trim()).filter(l => l);
  const startIdx = lines.indexOf(marker);
  if (startIdx === -1) return [];
  const endMarkers = ['===ALERTS===', '===LOGS===', '===STATISTICS===', '===CRITICAL_USERS===', '===SUSPICIOUS_USERS===', '===END==='];
  const result = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (endMarkers.includes(lines[i])) break;
    if (lines[i]) result.push(lines[i]);
  }
  return result;
}

//combierte logs de prolog en objetos Js
function parseLogs(output) {
  const lines = parseSection(output, '===LOGS===');
  return lines.map(line => {
    const parts = line.split('|');
    if (parts[0] !== 'LOG' || parts.length < 8) return null;
    return {
      timestamp: parts[1],
      usuario: parts[2],
      ip: parts[3],
      estado: parts[4],
      hora: parseInt(parts[5], 10) || 0,
      puerto: parseInt(parts[6], 10) || 0,
      pais: parts[7]
    };
  }).filter(Boolean);
}

//combierte alertas de prolog en objetos Js
function parseAlerts(output) {
  const lines = parseSection(output, '===ALERTS===');
  return lines.map(line => {
    const parts = line.split('|');
    if (parts[0] !== 'ALERTA' || parts.length < 7) return null;
    return {
      usuario: parts[1],
      ip: parts[2],
      regla: parts[3],
      severidad: parts[4],
      timestamp: parts[5],
      pais: parts[6]
    };
  }).filter(Boolean);
}

//combierte las estadisticas en texto a objetos Js
function parseStatistics(output) {
  const lines = parseSection(output, '===STATISTICS===');
  const stats = {
    total_logs: 0,
    total_alertas: 0,
    por_estado: {},
    por_usuario: {},
    por_pais: {},
    por_hora: {},
    por_puerto: {},
    por_regla: {},
    por_severidad: {}
  };
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.substring(0, idx).trim();
    const val = line.substring(idx + 1).trim();
    if (/^\d+$/.test(val)) {
      const num = parseInt(val, 10);
      if (key === 'total_logs') stats.total_logs = num;
      else if (key === 'total_alertas') stats.total_alertas = num;
    } else if (val.includes('=')) {
      const parts = val.split(',');
      const map = {};
      for (const p of parts) {
        const eqIdx = p.indexOf('=');
        if (eqIdx === -1) continue;
        const k = p.substring(0, eqIdx).trim();
        const v = parseInt(p.substring(eqIdx + 1).trim(), 10) || 0;
        map[k] = v;
      }
      if (key === 'por_estado') stats.por_estado = map;
      else if (key === 'por_usuario') stats.por_usuario = map;
      else if (key === 'por_pais') stats.por_pais = map;
      else if (key === 'por_hora') stats.por_hora = map;
      else if (key === 'por_puerto') stats.por_puerto = map;
      else if (key === 'por_regla') stats.por_regla = map;
      else if (key === 'por_severidad') stats.por_severidad = map;
    }
  }
  return stats;
}

//combierte los usuarios criticos de prolog en objetos Js
function parseCriticalUsers(output) {
  const lines = parseSection(output, '===CRITICAL_USERS===');
  return lines.map(line => {
    const parts = line.split('|');
    if (parts[0] !== 'CRITICAL' || parts.length < 3) return null;
    return { usuario: parts[1], motivo: parts[2] };
  }).filter(Boolean);
}

//combierte los usuarios sospechosos de prolog en objetos Js
function parseSuspiciousUsers(output) {
  const lines = parseSection(output, '===SUSPICIOUS_USERS===');
  return lines.map(line => {
    const parts = line.split('|');
    if (parts[0] !== 'SUSPICIOUS' || parts.length < 3) return null;
    return { usuario: parts[1], motivo: parts[2] };
  }).filter(Boolean);
}
//recibe el combined.pl -> Arma la consulta -> recibe resultado -> lo paresa -> devuelve el json
//forall(log(...), format(...)) -> para cada log existente, imprime cada log LOG|2026-05-21|admin1|45.33.22.1|fallo|2|22|rusia
//setoff(U,fuerza_bruta(U),FU2) -> obtener todos los que cumplan fuerza_bruta, U:variable, FU2:almacena resultado
//forall(member(...)) recorrer todos los usuarios encontrados
//once(log(...)) busca un log
// ;true -> si no hay resultado no falles
//findall -> encontrar todos
//format('imprime en este formato ~a(como ${},y los toma de la lista)',[e1,e2,e3,...])
async function  runFullAnalysis(factsFile) {
  const goal = `
    (
      writeln('===LOGS==='),
      forall(log(TS,User,IP,Estado,Hora,Puerto,Pais),
             format('LOG|~a|~a|~a|~a|~d|~d|~a~n',[TS,User,IP,Estado,Hora,Puerto,Pais])),
      writeln('===ALERTS==='),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),admin_fuera_horario(U)),FU1),
        forall(member(U2,FU1),
          (once(log(TS2,U2,IP2,_,_,_,C2)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U2,IP2,'admin_fuera_horario','alta',TS2,C2])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),fuerza_bruta(U)),FU2),
        forall(member(U3,FU2),
          (once(log(TS3,U3,IP3,_,_,_,C3)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U3,IP3,'fuerza_bruta','critica',TS3,C3])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),acceso_malicioso(U)),FU3),
        forall(member(U4,FU3),
          (once(log(TS4,U4,IP4,_,_,_,C4)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U4,IP4,'acceso_malicioso','critica',TS4,C4])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),multiples_ips(U)),FU4),
        forall(member(U5,FU4),
          (once(log(TS5,U5,IP5,_,_,_,C5)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U5,IP5,'multiples_ips','media',TS5,C5])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),acceso_simultaneo(U)),FU5),
        forall(member(U6,FU5),
          (once(log(TS6,U6,IP6,_,_,_,C6)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U6,IP6,'acceso_simultaneo','alta',TS6,C6])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),usuario_sospechoso(U)),FU6),
        forall(member(U7,FU6),
          (once(log(TS7,U7,IP7,_,_,_,C7)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U7,IP7,'usuario_sospechoso','media',TS7,C7])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),evento_critico(U)),FU7),
        forall(member(U8,FU7),
          (once(log(TS8,U8,IP8,_,_,_,C8)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U8,IP8,'evento_critico','critica',TS8,C8])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),intrusion_probable(U)),FU8),
        forall(member(U9,FU8),
          (once(log(TS9,U9,IP9,_,_,_,C9)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U9,IP9,'intrusion_probable','critica',TS9,C9])))
      ; true ),
      ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),usuario_critico(U)),FU9),
        forall(member(U10,FU9),
          (once(log(TS10,U10,IP10,_,_,_,C10)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U10,IP10,'usuario_critico','critica',TS10,C10])))
      ; true ),
      ( setof(IP,S^U^E^H^Pu^C^(log(S,U,IP,E,H,Pu,C),ataque_ip(IP)),FIP),
        forall(member(IP2,FIP),
          (once(log(TS11,U11,IP2,_,_,_,C11)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U11,IP2,'ataque_ip','alta',TS11,C11])))
      ; true ),
      ( setof(U,TS^IP^E^H^Pu^C^(log(TS,U,IP,E,H,Pu,C),multiples_paises(U)),FMP),
        forall(member(U12,FMP),
          (once(log(TS12,U12,IP12,_,_,_,C12)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U12,IP12,'multiples_paises','media',TS12,C12])))
      ; true ),
      ( setof(U,TS^IP^E^H^Pu^C^(log(TS,U,IP,E,H,Pu,C),solo_fallos(U)),FSF),
        forall(member(U13,FSF),
          (once(log(TS13,U13,IP13,_,_,_,C13)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U13,IP13,'solo_fallos','alta',TS13,C13])))
      ; true ),
      ( setof(P,TS^U^IP^E^H^Pu^(log(TS,U,IP,E,H,Pu,P),ataque_coordinado(P)),FAC),
        forall(member(P2,FAC),
          (once(log(TS14,U14,IP14,_,_,_,P2)),
           format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U14,IP14,'ataque_coordinado','critica',TS14,P2])))
      ; true ),
      writeln('===STATISTICS==='),
      findall(U,log(_,U,_,_,_,_,_),AllUsers), length(AllUsers,TotalLogs),
      format('total_logs: ~d~n',[TotalLogs]),
      ( setof(U-RULE,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),
          (admin_fuera_horario(U),RULE='admin_fuera_horario';
           fuerza_bruta(U),RULE='fuerza_bruta';
           acceso_malicioso(U),RULE='acceso_malicioso';
           multiples_ips(U),RULE='multiples_ips';
           acceso_simultaneo(U),RULE='acceso_simultaneo';
           usuario_sospechoso(U),RULE='usuario_sospechoso';
           evento_critico(U),RULE='evento_critico';
           intrusion_probable(U),RULE='intrusion_probable';
           usuario_critico(U),RULE='usuario_critico';
            ataque_ip(I),RULE='ataque_ip';
            multiples_paises(U),RULE='multiples_paises';
            solo_fallos(U),RULE='solo_fallos';
            ataque_coordinado(C),RULE='ataque_coordinado')),
        Pairs), length(Pairs,TotalAlerts)
      ; TotalAlerts=0 ),
      format('total_alertas: ~d~n',[TotalLogs]),
      ( setof(Estado,US^IP^TS^Hora^Puerto^Pais^log(TS,US,IP,Estado,Hora,Puerto,Pais),Estados),
        forall(member(E,Estados),
          ( findall(1,log(_,_,_,E,_,_,_),L), length(L,Cnt),
            format('por_estado: ~a=~d',[E,Cnt]),
            (Estados=[_|_],write(',');true)
          )),
        nl
      ; writeln('por_estado:') ),
      ( setof(User,TS^IP^Estado^Hora^Puerto^Pais^log(TS,User,IP,Estado,Hora,Puerto,Pais),Usuarios),
        forall(member(U,Usuarios),
          ( findall(1,log(_,U,_,_,_,_,_),L2), length(L2,Cnt2),
            format('por_usuario: ~a=~d',[U,Cnt2]),
            (Usuarios=[_|_],write(',');true)
          )),
        nl
      ; writeln('por_usuario:') ),
      ( setof(Pais,TS^User^IP^Estado^Hora^Puerto^log(TS,User,IP,Estado,Hora,Puerto,Pais),Paises),
        forall(member(P,Paises),
          ( findall(1,log(_,_,_,_,_,_,P),L3), length(L3,Cnt3),
            format('por_pais: ~a=~d',[P,Cnt3]),
            (Paises=[_|_],write(',');true)
          )),
        nl
      ; writeln('por_pais:') ),
      ( setof(Hora,TS^User^IP^Estado^Puerto^Pais^log(TS,User,IP,Estado,Hora,Puerto,Pais),Horas),
        forall(member(H,Horas),
          ( findall(1,log(_,_,_,_,H,_,_),L4), length(L4,Cnt4),
            format('por_hora: ~d=~d',[H,Cnt4]),
            (Horas=[_|_],write(',');true)
          )),
        nl
      ; writeln('por_hora:') ),
      ( setof(Puerto,TS^User^IP^Estado^Hora^Pais^log(TS,User,IP,Estado,Hora,Puerto,Pais),Puertos),
        forall(member(P,Puertos),
          ( findall(1,log(_,_,_,_,_,P,_),L5), length(L5,Cnt5),
            format('por_puerto: ~d=~d',[P,Cnt5]),
            (Puertos=[_|_],write(',');true)
          )),
        nl
      ; writeln('por_puerto:') ),
      writeln('===CRITICAL_USERS==='),
      ( setof(U11,S11^I11^E11^H11^P11^C11^(log(S11,U11,I11,E11,H11,P11,C11),
           (usuario_critico(U11);intrusion_probable(U11))),FC),
        forall(member(U12,FC),
          format('CRITICAL|~a|~a~n',[U12,'Actividad critica detectada']))
      ; true ),
      writeln('===SUSPICIOUS_USERS==='),
      ( setof(U13,S13^I13^E13^H13^P13^C13^(log(S13,U13,I13,E13,H13,P13,C13),
           usuario_sospechoso(U13)),FS),
        forall(member(U14,FS),
          format('SUSPICIOUS|~a|~a~n',[U14,'Actividad sospechosa detectada']))
      ; true ),
      writeln('===END===')
    )`;
  const output = await runGoal(goal, factsFile);
  return {
    logs: parseLogs(output),
    alerts: parseAlerts(output),
    statistics: parseStatistics(output),
    criticalUsers: parseCriticalUsers(output),
    suspiciousUsers: parseSuspiciousUsers(output),
    alertCount: parseAlerts(output).length
  };
}

async function getAlerts(factsFile) {
  const goal = `
    writeln('===ALERTS==='),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),admin_fuera_horario(U)),FU1),
      forall(member(U2,FU1),
        (once(log(TS2,U2,IP2,_,_,_,C2)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U2,IP2,'admin_fuera_horario','alta',TS2,C2])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),fuerza_bruta(U)),FU2),
      forall(member(U3,FU2),
        (once(log(TS3,U3,IP3,_,_,_,C3)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U3,IP3,'fuerza_bruta','critica',TS3,C3])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),acceso_malicioso(U)),FU3),
      forall(member(U4,FU3),
        (once(log(TS4,U4,IP4,_,_,_,C4)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U4,IP4,'acceso_malicioso','critica',TS4,C4])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),multiples_ips(U)),FU4),
      forall(member(U5,FU4),
        (once(log(TS5,U5,IP5,_,_,_,C5)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U5,IP5,'multiples_ips','media',TS5,C5])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),acceso_simultaneo(U)),FU5),
      forall(member(U6,FU5),
        (once(log(TS6,U6,IP6,_,_,_,C6)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U6,IP6,'acceso_simultaneo','alta',TS6,C6])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),usuario_sospechoso(U)),FU6),
      forall(member(U7,FU6),
        (once(log(TS7,U7,IP7,_,_,_,C7)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U7,IP7,'usuario_sospechoso','media',TS7,C7])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),evento_critico(U)),FU7),
      forall(member(U8,FU7),
        (once(log(TS8,U8,IP8,_,_,_,C8)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U8,IP8,'evento_critico','critica',TS8,C8])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),intrusion_probable(U)),FU8),
      forall(member(U9,FU8),
        (once(log(TS9,U9,IP9,_,_,_,C9)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U9,IP9,'intrusion_probable','critica',TS9,C9])))
    ; true ),
    ( setof(U,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),usuario_critico(U)),FU9),
      forall(member(U10,FU9),
        (once(log(TS10,U10,IP10,_,_,_,C10)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U10,IP10,'usuario_critico','critica',TS10,C10])))
    ; true ),
    ( setof(IP,S^U^E^H^Pu^C^(log(S,U,IP,E,H,Pu,C),ataque_ip(IP)),FIP),
      forall(member(IP2,FIP),
        (once(log(TS11,U11,IP2,_,_,_,C11)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U11,IP2,'ataque_ip','alta',TS11,C11])))
    ; true ),
    ( setof(U,TS^IP^E^H^Pu^C^(log(TS,U,IP,E,H,Pu,C),multiples_paises(U)),FMP),
      forall(member(U12,FMP),
        (once(log(TS12,U12,IP12,_,_,_,C12)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U12,IP12,'multiples_paises','media',TS12,C12])))
    ; true ),
    ( setof(U,TS^IP^E^H^Pu^C^(log(TS,U,IP,E,H,Pu,C),solo_fallos(U)),FSF),
      forall(member(U13,FSF),
        (once(log(TS13,U13,IP13,_,_,_,C13)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U13,IP13,'solo_fallos','alta',TS13,C13])))
    ; true ),
    ( setof(P,TS^U^IP^E^H^Pu^(log(TS,U,IP,E,H,Pu,P),ataque_coordinado(P)),FAC),
      forall(member(P2,FAC),
        (once(log(TS14,U14,IP14,_,_,_,P2)),
         format('ALERTA|~a|~a|~a|~a|~a|~a~n',[U14,IP14,'ataque_coordinado','critica',TS14,P2])))
    ; true ),
    writeln('===END===')`;
  const output = await runGoal(goal, factsFile);
  return parseAlerts(output);
}

async function getLogs(factsFile) {
  const goal = `
    writeln('===LOGS==='),
    forall(log(TS,User,IP,Estado,Hora,Puerto,Pais),
           format('LOG|~a|~a|~a|~a|~d|~d|~a~n',[TS,User,IP,Estado,Hora,Puerto,Pais])),
    writeln('===END===')`;
  const output = await runGoal(goal, factsFile);
  return parseLogs(output);
}

async function getStatistics(factsFile) {
  const goal = `
    writeln('===STATISTICS==='),
    findall(U,log(_,U,_,_,_,_,_),AllUsers), length(AllUsers,TotalLogs),
    format('total_logs: ~d~n',[TotalLogs]),
    ( setof(U-RULE,S^I^E^H^Pu^C^(log(S,U,I,E,H,Pu,C),
        (admin_fuera_horario(U),RULE='admin_fuera_horario';
         fuerza_bruta(U),RULE='fuerza_bruta';
         acceso_malicioso(U),RULE='acceso_malicioso';
         multiples_ips(U),RULE='multiples_ips';
         acceso_simultaneo(U),RULE='acceso_simultaneo';
         usuario_sospechoso(U),RULE='usuario_sospechoso';
         evento_critico(U),RULE='evento_critico';
         intrusion_probable(U),RULE='intrusion_probable';
         usuario_critico(U),RULE='usuario_critico';
         ataque_ip(I),RULE='ataque_ip';
         multiples_paises(U),RULE='multiples_paises';
         solo_fallos(U),RULE='solo_fallos';
         ataque_coordinado(C),RULE='ataque_coordinado')),
     Pairs), length(Pairs,TotalAlerts)
    ; TotalAlerts=0 ),
    format('total_alertas: ~d~n',[TotalAlerts]),
    ( setof(Estado,US^IP^TS^Hora^Puerto^Pais^log(TS,US,IP,Estado,Hora,Puerto,Pais),Estados),
      forall(member(E,Estados),
        ( findall(1,log(_,_,_,E,_,_,_),L), length(L,Cnt),
          format('por_estado: ~a=~d',[E,Cnt]),
          (Estados=[_|_],write(',');true)
        )),
      nl
    ; writeln('por_estado:') ),
    ( setof(User,TS^IP^Estado^Hora^Puerto^Pais^log(TS,User,IP,Estado,Hora,Puerto,Pais),Usuarios),
      forall(member(U,Usuarios),
        ( findall(1,log(_,U,_,_,_,_,_),L2), length(L2,Cnt2),
          format('por_usuario: ~a=~d',[U,Cnt2]),
          (Usuarios=[_|_],write(',');true)
        )),
      nl
    ; writeln('por_usuario:') ),
    ( setof(Pais,TS^User^IP^Estado^Hora^Puerto^log(TS,User,IP,Estado,Hora,Puerto,Pais),Paises),
      forall(member(P,Paises),
        ( findall(1,log(_,_,_,_,_,_,P),L3), length(L3,Cnt3),
          format('por_pais: ~a=~d',[P,Cnt3]),
          (Paises=[_|_],write(',');true)
        )),
      nl
    ; writeln('por_pais:') ),
    ( setof(Hora,TS^User^IP^Estado^Puerto^Pais^log(TS,User,IP,Estado,Hora,Puerto,Pais),Horas),
      forall(member(H,Horas),
        ( findall(1,log(_,_,_,_,H,_,_),L4), length(L4,Cnt4),
          format('por_hora: ~d=~d',[H,Cnt4]),
          (Horas=[_|_],write(',');true)
        )),
      nl
    ; writeln('por_hora:') ),
    ( setof(Puerto,TS^User^IP^Estado^Hora^Pais^log(TS,User,IP,Estado,Hora,Puerto,Pais),Puertos),
      forall(member(P,Puertos),
        ( findall(1,log(_,_,_,_,_,P,_),L5), length(L5,Cnt5),
          format('por_puerto: ~d=~d',[P,Cnt5]),
          (Puertos=[_|_],write(',');true)
        )),
      nl
    ; writeln('por_puerto:') ),
    writeln('===END===')`;
  const output = await runGoal(goal, factsFile);
  return parseStatistics(output);
}

module.exports = { runFullAnalysis, getAlerts, getLogs, getStatistics };
