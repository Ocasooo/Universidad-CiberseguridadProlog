const fs = require('fs');
const path = require('path');
const prologService = require('./prologService');

async function generateReport(factsFile) {
  const reportPath = await prologService.runReport(factsFile);

  if (!fs.existsSync(reportPath)) {
    throw new Error('No se pudo generar el reporte desde Prolog');
  }

  return reportPath;
}

module.exports = { generateReport };
