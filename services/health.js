const { promisify } = require('util');
const { exec } = require('child_process');
const fs = require('fs').promises;
const os = require('os');

const execAsync = promisify(exec);

// Convierte tamaños (ej: "20G") a GB numérico
const parseSizeToGB = (val) => {
  if (!val) return null;
  const match = String(val).trim().match(/^([0-9.]+)([KMGTP]?)/i);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase() || 'B';
  const powers = { B: 0, K: 1, M: 2, G: 3, T: 4, P: 5 };
  const pow = powers[unit] ?? 0;
  return Number(((num * 1024 ** pow) / 1024 ** 3).toFixed(2));
};

// Salud del servidor para /api/health
async function getInteliServerStatus() {
  const resObj = {
    ramLibreGB: 'error',
    uptimeDias: 'error',
    cpu: { actual: 'error', pico15min: 'error' },
    disco: { totalGB: 'error', libreGB: 'error', usoPorcentaje: 'error' },
    servicios: {
      docker: 'error',
      mongodb: 'error',
      nginx: 'error',
      backendSepa: 'error',
    },
    temperaturaCPU: null,
  };

  // RAM libre (GB)
  try {
    const { stdout } = await execAsync('free -g');
    const memLine = stdout.split('\n').find((l) => l.toLowerCase().startsWith('mem'));
    if (memLine) {
      const parts = memLine.trim().split(/\s+/);
      const available = parseInt(parts[6] || parts[3], 10);
      if (!Number.isNaN(available)) resObj.ramLibreGB = available;
    }
  } catch (error) {
    console.error('[health] RAM', error.message);
  }

  // Uptime en días
  try {
    const { stdout } = await execAsync('uptime -p');
    const match = stdout.match(/(\d+)\s*day/);
    resObj.uptimeDias = match ? parseInt(match[1], 10) : 0;
  } catch (error) {
    console.error('[health] uptime', error.message);
  }

  // CPU actual (100 - idle)
  try {
    const { stdout } = await execAsync(`top -bn1 | grep "Cpu(s)"`);
    const idleMatch = stdout.replace(',', '.').match(/([0-9.]+)\s*id/);
    if (idleMatch) {
      const idle = parseFloat(idleMatch[1]);
      const usage = Number((100 - idle).toFixed(2));
      resObj.cpu.actual = usage;
    }
  } catch (error) {
    console.error('[health] CPU actual', error.message);
  }

  // CPU pico 15 min (load average)
  try {
    const { stdout } = await execAsync('uptime');
    const loadPart = stdout.split('load average:')[1];
    if (loadPart) {
      const loads = loadPart.split(',').map((v) => parseFloat(v.trim()));
      const fifteen = loads[2];
      if (!Number.isNaN(fifteen)) resObj.cpu.pico15min = fifteen;
    }
  } catch (error) {
    console.error('[health] load average', error.message);
  }

  // Disco raíz
  try {
    const { stdout } = await execAsync('df -h /');
    const line = stdout.split('\n')[1];
    if (line) {
      const parts = line.trim().split(/\s+/);
      const size = parseSizeToGB(parts[1]);
      const avail = parseSizeToGB(parts[3]);
      const usePct = parts[4]?.replace('%', '');
      resObj.disco.totalGB = size ?? 'error';
      resObj.disco.libreGB = avail ?? 'error';
      resObj.disco.usoPorcentaje = !Number.isNaN(parseFloat(usePct))
        ? parseFloat(usePct)
        : 'error';
    }
  } catch (error) {
    console.error('[health] disco', error.message);
  }

  // Servicios
  const serviceChecks = [
    ['docker', 'systemctl is-active docker'],
    ['mongodb', 'systemctl is-active mongod'],
    ['nginx', 'systemctl is-active nginx'],
    ['backendSepa', 'systemctl is-active sepa-backend.service'],
  ];
  for (const [key, cmd] of serviceChecks) {
    try {
      const { stdout } = await execAsync(cmd);
      resObj.servicios[key] = stdout.trim() === 'active' ? 'ok' : 'error';
    } catch (error) {
      resObj.servicios[key] = 'error';
      console.error(`[health] servicio ${key}`, error.message);
    }
  }

  // Temperatura CPU
  try {
    const raw = await fs.readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    const milliC = parseInt(raw.trim(), 10);
    resObj.temperaturaCPU = Number.isNaN(milliC) ? null : Number((milliC / 1000).toFixed(1));
  } catch (error) {
    resObj.temperaturaCPU = null;
    // no logueamos como error fuerte; puede no existir
  }

  return resObj;
}

// Handler HTTP para /api/health
const getItem = async (req, res) => {
  try {
    const server = await getInteliServerStatus();
    return res.status(200).send({ status: 'success', data: server });
  } catch (error) {
    console.error('[health] error general', error);
    return res.status(500).send({ status: 'error', message: 'No se pudo obtener el estado' });
  }
};

module.exports = { getItem, getInteliServerStatus };
