const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); //lib para convertir css a object js

const PROLOG_DIR = path.join(__dirname, 'prolog');

function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath, { encoding: 'utf-8' }) //Abre el archivo y lee linea por linea
      .on('error', (err) => reject(new Error('Error al leer el archivo CSV: ' + err.message)))// fallo lectura
      .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))//conecta el CSV parser con el stream del archivo
      .on('data', (row) => {
        const trimmed = {};
        for (const key of Object.keys(row)) {
          trimmed[key] = (row[key] || '').trim(); //limpiar espacios
        }

        if (trimmed.timestamp && trimmed.usuario && trimmed.ip) {
          rows.push({ // guarda la fila
            timestamp: trimmed.timestamp,
            usuario: trimmed.usuario,
            ip: trimmed.ip,
            estado: trimmed.estado || 'desconocido',
            hora: parseInt(trimmed.hora, 10) || 0,
            puerto: parseInt(trimmed.puerto, 10) || 0,
            pais: trimmed.pais || 'desconocido'
          });
        }
      })
      .on('end', () => {
        if (rows.length === 0) {//no logs validos = error
          return reject(new Error('El CSV no contiene datos validos'));
        }
        resolve(rows);
      })
      .on('error', (err) => reject(new Error('Error procesando CSV: ' + err.message)));
  });
}

//combierte los objetos js en hechos prolog
function generateLogFacts(rows) {
  let out = '';
  for (const row of rows) {
    out += 'log(';
    out += quoteProlog(row.timestamp) + ', ';
    out += atomOrString(row.usuario) + ', ';
    out += quoteProlog(row.ip) + ', ';
    out += atomOrString(row.estado) + ', ';
    out += row.hora + ', ';
    out += row.puerto + ', ';
    out += atomOrString(row.pais);
    out += ').\n';
  }
  return out;
}

//archivo final prolog
function writeFactsFile(rows) {
  if (!fs.existsSync(PROLOG_DIR)) {
    fs.mkdirSync(PROLOG_DIR, { recursive: true });
  }

  //abre la base de conocimiento y la lee
  const KB_FILE = path.join(PROLOG_DIR, 'baseConocimientoCiberseguridad.pl');
  let kbContent = fs.readFileSync(KB_FILE, 'utf-8');

  //construye el archivo compuesto de la base y los logs csv
  const csvFacts = generateLogFacts(rows);
  const nl = kbContent.includes('\r\n') ? '\r\n' : '\n';
  const combined = kbContent.trimEnd() + nl + nl + '% Hechos temporales del CSV' + nl + csvFacts;

  const combinedFile = path.join(PROLOG_DIR, 'combined.pl');
  fs.writeFileSync(combinedFile, combined, 'utf-8');
  return combinedFile;
}

function atomOrString(value) {
  if (!value || value === '') return "''";
  const str = String(value);
  if (/^\d+$/.test(str)) return str;
  if (/^[a-z][a-zA-Z0-9_]*$/.test(str)) return str;
  return "'" + str.replace(/'/g, "\\'") + "'";
}

function quoteProlog(value) {
  if (!value) return "''";
  return "'" + String(value).replace(/'/g, "\\'") + "'";
}

module.exports = { processCSV, writeFactsFile };
