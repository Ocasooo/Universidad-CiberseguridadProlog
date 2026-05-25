const express = require('express');
const cors = require('cors');
const multer = require('multer'); //maneja archivos y uploads
const path = require('path');
const fs = require('fs');
const csvService = require('./csvService'); //leer/parsear/convertir a hechos
const prologService = require('./prologService');//ejecula prlog/queries/alertas
const reportService = require('./reportService');//generar reportes

const app = express();
const PORT = process.env.PORT || 3001;

//Rutas de archivos
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PROLOG_DIR = path.join(__dirname, 'prolog');
const FACTS_FILE = path.join(PROLOG_DIR, 'combined.pl');

//Si no existen las carpetas las crea
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PROLOG_DIR)) fs.mkdirSync(PROLOG_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.csv';
    cb(null, 'upload_' + Date.now() + ext);
  }
});

//middleware de multer
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.csv' ||
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } //tamaño maximo de archivo 10mb
});


app.use(cors());
app.use(express.json());

//Endpoinds

app.get('/', (_req, res) => {
  res.json({
    name: 'cybersecurity Backend',
    version: '1.0.0',
    status: 'running',
    prolog: process.platform === 'win32' ? 'swipl.exe' : 'swipl',
    factsLoaded: fs.existsSync(FACTS_FILE)
  });
});


app.post('/upload-csv', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se envio ningun archivo CSV' });
    }
    try {
      const rows = await csvService.processCSV(req.file.path); //convierte cada linea en un objeto js
      try { fs.unlinkSync(req.file.path); } catch {} //borra csv temporal
      const factsFile = csvService.writeFactsFile(rows); //genera los hechos y genera combined.pl
      const analysis = await prologService.runFullAnalysis(factsFile); //ejecuta prolog

      res.json({
        success: true,
        message: 'CSV procesado exitosamente',
        records: rows.length,
        alerts: analysis.alerts,
        alertCount: analysis.alertCount,
        criticalUsers: analysis.criticalUsers,
        statistics: analysis.statistics,
        logs: analysis.logs
      });
    } catch (ex) {
      res.status(500).json({ success: false, error: ex.message });
    }
  });
});

app.get('/alerts', async (_req, res) => {
  if (!fs.existsSync(FACTS_FILE)) return res.json([]);
  try {
    const result = await prologService.getAlerts(FACTS_FILE);
    res.json(result);
  } catch (ex) {
    res.status(500).json({ success: false, error: ex.message });
  }
});

app.get('/logs', async (_req, res) => {
  if (!fs.existsSync(FACTS_FILE)) return res.json([]);
  try {
    const result = await prologService.getLogs(FACTS_FILE);
    res.json(result);
  } catch (ex) {
    res.status(500).json({ success: false, error: ex.message });
  }
});

app.get('/statistics', async (_req, res) => {
  if (!fs.existsSync(FACTS_FILE)) {
    return res.json({ total_logs: 0, total_alertas: 0, por_estado: {}, por_usuario: {}, por_pais: {}, por_hora: {}, por_puerto: {}, por_regla: {}, por_severidad: {} });
  }
  try {
    const result = await prologService.getStatistics(FACTS_FILE);
    res.json(result);
  } catch (ex) {
    res.status(500).json({ success: false, error: ex.message });
  }
});

app.get('/report', async (_req, res) => {
  try {
    const reportPath = await reportService.generateReport();
    res.download(reportPath, 'reporte_cyberlogic.txt');
  } catch (ex) {
    res.status(500).json({ success: false, error: ex.message });
  }
});

app.get('/blacklist', (_req, res) => {
  try {
    const prologFile = path.join(PROLOG_DIR, 'baseConocimientoCiberseguridad.pl');
    if (!fs.existsSync(prologFile)) {
      return res.json({ success: true, ips: [] });
    }
    const content = fs.readFileSync(prologFile, 'utf-8');
    const ips = [];
    const regex = /^[\t ]*blacklist\('([^']+)'\)\./gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      ips.push(match[1]);
    }
    res.json({ success: true, ips });
  } catch (ex) {
    res.status(500).json({ success: false, error: ex.message });
  }
});

//midleware global de errores
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: err.message });
});


function startServer(port) {
  app.listen(port, () => {
    console.log('cybersecurity Backend corriendo en puerto ' + port);
    console.log('SWI-Prolog: ' + (process.platform === 'win32' ? 'swipl.exe' : 'swipl'));
    console.log('Base conocimiento: ' + path.join(PROLOG_DIR, 'baseConocimientoCiberseguridad.pl'));
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('Puerto ' + port + ' ocupado, intentando puerto ' + (port + 1) + '...');
      startServer(port + 1);
    } else {
      console.error('Error al iniciar servidor:', err.message);
      process.exit(1);
    }
  });
}

startServer(PORT);
