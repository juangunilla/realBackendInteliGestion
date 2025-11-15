const SUPERADMIN_ROLE = 'superadmin';
const PUBLIC_ROLES = ['seguidor', 'profe'];
const MANAGEMENT_ROLES = ['admin'];
const ALL_ROLES = [...new Set([...PUBLIC_ROLES, ...MANAGEMENT_ROLES, SUPERADMIN_ROLE])];
const REGISTRATION_ROLES = [...new Set([...PUBLIC_ROLES, ...MANAGEMENT_ROLES])];
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'gunillajuan@gmail.com').toLowerCase();

module.exports = {
  ALL_ROLES,
  REGISTRATION_ROLES,
  SUPERADMIN_ROLE,
  SUPER_ADMIN_EMAIL,
};
