const mongoose = require('mongoose');
const XLSX = require('xlsx');

const Cliente = require('./models/clientes');
const Establecimiento = require('./models/establecimientos');
require('./models/profesionales');
require('./models/ciuu');

async function main() {
  await mongoose.connect('mongodb://72.61.45.133:27017/inteli_gestion', {
    serverSelectionTimeoutMS: 5000
  });

  console.log('Mongo conectado');

  const workbook = XLSX.readFile('./clientes.xls');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const clientesMap = {};

  for (const r of rows) {
    const cuit = String(r['Cuit']).trim();

    if (!clientesMap[cuit]) {
      clientesMap[cuit] = {
        razonSocial: r['Empresas'],
        nombreFantasia: r['Empresas'],
        domicilio: r['Dirección de visita'],
        cuit,
        establecimientos: []
      };
    }

    clientesMap[cuit].establecimientos.push({
      nombre: r['Empresas'],
      direccion: r['Dirección de visita'],
      localidad: r['Localidad'],
      frecuencia: r['Periodicidad'],
      responsable: r['visitar']
    });
  }

  for (const clienteData of Object.values(clientesMap)) {
    const establecimientosIds = [];

    for (const est of clienteData.establecimientos) {
      const nuevoEst = await Establecimiento.create(est);
      establecimientosIds.push(nuevoEst._id);
    }

    await Cliente.create({
      razonSocial: clienteData.razonSocial,
      nombreFantasia: clienteData.nombreFantasia,
      domicilio: clienteData.domicilio,
      cuit: clienteData.cuit,
      establecimientos: establecimientosIds
    });
  }

  console.log('Base importada correctamente');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
