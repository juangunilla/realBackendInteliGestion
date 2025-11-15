const setVencimiento = (schema) => {
    schema.pre('save', function (next) {
      if (this.confeccion) {
        // Si la fecha de confección está definida, establece la fecha de vencimiento tres meses después
        const vencimientoDate = new Date(this.confeccion);
        vencimientoDate.setMonth(vencimientoDate.getMonth() + 3);
        this.vencimiento = vencimientoDate;
      }
      next();
    });
  };
  
  module.exports = { setVencimiento };
  