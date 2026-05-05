const { sendDueTodayNotifications } = require('../helpers/studyDueNotifications');

const checkDueTasks = async (options = {}) => {
  const result = await sendDueTodayNotifications(options);

  console.log(
    `[REMINDER] Vencimientos del día procesados. Estudios: ${result.studies}. Usuarios notificados: ${result.notifiedUsers}.`
  );

  return result;
};

module.exports = {
  checkDueTasks,
};
