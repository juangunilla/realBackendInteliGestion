const mongoose = require('mongoose');
const Cliente = require('./models/clientes');

const datos = `
1 'Abridores Lili S.R.L.'  '33-70805347-9'
2 'Acevedo Daniel y Rafael Acevedo S.H.' '33-69008416-9'
3 'Acrimol S.A '  '30-62639602-6'
4 'Agrigel S.A. '  '30-64180276-6'
5 'Agrigel S.A. '  '30-64180276-6'
`;

function parseLinea(linea) {
  const match = linea.match(/(\d+)\s+'([^']+)'.*?'([^']+)'$/);
  if (!match) return null;

  return {
    razonSocial: match[2].trim(),
    nombreFantasia: match[2].trim(),
    cuit: match[3].trim()
  };
}

async function importarClientes() {
  await mongoose.connect('mongodb://72.61.45.133:27017/inteli_gestion');
  console.log('Mongo conectado');

  const filas = datos.trim().split('\n');
  const clientes = filas
    .map(parseLinea)
    .filter(Boolean);

  for (const cliente of clientes) {
    const existe = await Cliente.findOne({ cuit: cliente.cuit });

    if (existe) {
      console.log(`⏭️  Cliente ya existe: ${cliente.cuit}`);
      continue;
    }

    await Cliente.create({
      razonSocial: cliente.razonSocial,
      nombreFantasia: cliente.nombreFantasia,
      cuit: cliente.cuit,
      establecimientos: []
    });

    console.log(`✅ Cliente creado: ${cliente.razonSocial}`);
  }

  await mongoose.disconnect();
  console.log('Importación finalizada');
}

importarClientes().catch(err => {
  console.error(err);
  process.exit(1);
});
