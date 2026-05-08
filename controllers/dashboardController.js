const { getDashboardMetrics } = require('../services/dashboardService');

const getMetrics = async (req, res) => {
  try {
    const data = await getDashboardMetrics();

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('[DASHBOARD] Error al obtener métricas', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudieron obtener las métricas del dashboard',
    });
  }
};

module.exports = {
  getMetrics,
};
