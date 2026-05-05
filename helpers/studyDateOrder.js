const DATE_PREFIX_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

const extractComparableDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(DATE_PREFIX_PATTERN);
    if (match) {
      return match[1];
    }

    value = trimmed;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const isStudyDateOnOrAfterMeasurement = (payload = {}) => {
  const fechaMedicion = extractComparableDate(payload.fechaMedicion);
  const fechaEstudio = extractComparableDate(payload.fechaEstudio);

  if (fechaMedicion === null || fechaEstudio === null) {
    return true;
  }

  return fechaEstudio >= fechaMedicion;
};

const getStudyDateOrderError = (payload = {}) => {
  if (isStudyDateOnOrAfterMeasurement(payload)) {
    return null;
  }

  return 'La fecha del estudio no puede ser anterior a la fecha de medición';
};

module.exports = {
  extractComparableDate,
  getStudyDateOrderError,
  isStudyDateOnOrAfterMeasurement,
};
