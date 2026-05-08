const calculateVencimientoFromConfeccion = (confeccion, monthsToAdd = 3) => {
  if (!confeccion) {
    return null;
  }

  const vencimientoDate = new Date(confeccion);
  vencimientoDate.setMonth(vencimientoDate.getMonth() + monthsToAdd);
  return vencimientoDate;
};

const setVencimiento = (schema, options = {}) => {
  const { monthsToAdd = 3 } = options;

  schema.pre('save', function (next) {
    if (this.confeccion) {
      this.vencimiento = calculateVencimientoFromConfeccion(this.confeccion, monthsToAdd);
    }
    next();
  });
};

module.exports = { setVencimiento, calculateVencimientoFromConfeccion };
  
