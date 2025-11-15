const setVencimiento = (schema) => {
  schema.pre('save', function (next) {
    if (this.confeccion) {
      // Si la fecha de confección está definida, establece la fecha de vencimiento un año después
      const vencimientoDate = new Date(this.confeccion);
      vencimientoDate.setFullYear(vencimientoDate.getFullYear() + 1);
      this.vencimiento = vencimientoDate;
    }
    next();
  });
};

module.exports = { setVencimiento };
