const os = require('os');

const getItem = async (req, res, next) => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const version = os.version()
    const cpus =os.cpus()
    const uptimeSeconds =os.uptime()
    const totalMemoryMB = (totalMemory / (1024 * 1024)).toFixed(2);
    const freeMemoryMB = (freeMemory / (1024 * 1024)).toFixed(2);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);
    res.status(200).send({
        status: 'success',
        data: {
            totalMemoryMB,
            freeMemoryMB,
            version,
            uptimeDays,
            cpus
        }
    });
};

module.exports = { getItem };
