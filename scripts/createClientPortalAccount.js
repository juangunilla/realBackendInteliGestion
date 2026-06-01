require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ClientPortalAccount = require('../models/clientPortalAccount');

const run = async () => {
  const dbUri = process.env.DB_URI;
  const email = (process.env.CLIENT_PORTAL_TEST_EMAIL || '').trim().toLowerCase();
  const password = process.env.CLIENT_PORTAL_TEST_PASSWORD || '';
  const contactName = process.env.CLIENT_PORTAL_TEST_CONTACT || 'Cliente Portal';
  const clienteIds = (process.env.CLIENT_PORTAL_TEST_CLIENTE_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedEstablecimientoIds = (process.env.CLIENT_PORTAL_TEST_ESTABLECIMIENTO_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!dbUri) throw new Error('Falta DB_URI');
  if (!email || !password || !clienteIds.length) {
    throw new Error(
      'Definí CLIENT_PORTAL_TEST_EMAIL, CLIENT_PORTAL_TEST_PASSWORD y CLIENT_PORTAL_TEST_CLIENTE_IDS'
    );
  }

  await mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const passwordHash = await bcrypt.hash(password, 10);

  const account = await ClientPortalAccount.findOneAndUpdate(
    { email },
    {
      email,
      passwordHash,
      active: true,
      contactName,
      clienteIds,
      allowedEstablecimientoIds,
      permissions: {
        canViewStudies: true,
        canViewDocuments: false,
        canViewMetrics: false,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log('Cuenta portal lista:', {
    id: `${account._id}`,
    email: account.email,
    clienteIds: account.clienteIds.map((id) => `${id}`),
    allowedEstablecimientoIds: account.allowedEstablecimientoIds.map((id) => `${id}`),
  });

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
