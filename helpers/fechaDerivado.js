const normalizeFechaDerivadoPayload = (payload = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  const dateFields = ['fechaDerivado', 'fechaDerivadoProveedor'];
  let normalizedPayload = payload;

  dateFields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) {
      return;
    }

    if (typeof payload[field] !== 'string') {
      return;
    }

    if (normalizedPayload === payload) {
      normalizedPayload = { ...payload };
    }

    const normalizedValue = payload[field].trim();
    normalizedPayload[field] = normalizedValue === '' ? null : normalizedValue;
  });

  return normalizedPayload;
};

module.exports = { normalizeFechaDerivadoPayload };
