const normalizeEntregaDocumentacionValue = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false' || normalized === '') {
      return false;
    }
  }

  return Boolean(value);
};

const normalizeEntregaDocumentacionPayload = (payload = {}) => {
  if (!Object.prototype.hasOwnProperty.call(payload, 'entregaDocumentacion')) {
    return payload;
  }

  return {
    ...payload,
    entregaDocumentacion: normalizeEntregaDocumentacionValue(
      payload.entregaDocumentacion
    ),
  };
};

const normalizeEntregaDocumentacionDoc = (doc) => {
  if (!doc) {
    return doc;
  }

  if (typeof doc.toObject === 'function') {
    const normalized = doc.toObject();
    normalized.entregaDocumentacion = normalizeEntregaDocumentacionValue(
      normalized.entregaDocumentacion
    );
    return normalized;
  }

  return {
    ...doc,
    entregaDocumentacion: normalizeEntregaDocumentacionValue(
      doc.entregaDocumentacion
    ),
  };
};

const normalizeEntregaDocumentacionDocs = (docs = []) =>
  docs.map(normalizeEntregaDocumentacionDoc);

module.exports = {
  normalizeEntregaDocumentacionValue,
  normalizeEntregaDocumentacionPayload,
  normalizeEntregaDocumentacionDoc,
  normalizeEntregaDocumentacionDocs,
};
