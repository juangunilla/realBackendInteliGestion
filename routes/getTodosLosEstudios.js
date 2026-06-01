const moment = require('moment');

// Modelos
const AguaBacteriologico = require('../models/form/aguaBacteriologico');
const AguaFisicoQuimico = require('../models/form/aguaFisicoQuimico');
const pat = require('../models/form/pat');
const asp = require('../models/form/asp');
const capacitaciones = require('../models/form/capacitaciones');
const {
  CertificadoRedIncendio,
} = require('../models/form/certificadoRedIncendio');
const iluruido = require('../models/form/iluminacionyruido');
const ergonomico = require('../models/form/ergonomico');
const art = require('../models/form/art');
const vibracion = require('../models/form/vibracion');
const antisinestral = require('../models/form/antisinestral');
const verificacion = require('../models/form/verificacion');
const estudioh = require('../models/form/estudiohumo');
const entregaepp = require('../models/form/entregaepp');
const {
  ResiduosEspeciales,
} = require('../models/form/residuosEspeciales');
const { Termografia } = require('../models/form/termografia');
const {
  normalizeEntregaDocumentacionDoc,
} = require('../helpers/entregaDocumentacion');

const getTodosLosEstudiosDelMes = async () => {
  const start = moment().startOf('month').toDate();
  const end = moment().endOf('month').toDate();

  const [
    aguaB, aguaF, patData, aspData, capData, certificadoRedIncendioData, iluruidoData, ergoData, artData, vibraData, 
    antiData, verifData, humoData, eppData, residuosEspecialesData, termografiaData
  ] = await Promise.all([
    AguaBacteriologico.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    AguaFisicoQuimico.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    pat.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    asp.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    capacitaciones.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    CertificadoRedIncendio.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    iluruido.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    ergonomico.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    art.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    vibracion.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    antisinestral.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    verificacion.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    estudioh.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    entregaepp.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    ResiduosEspeciales.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente profesional establecimiento'),
    Termografia.find({ vencimiento: { $gte: start, $lte: end } }).populate('cliente establecimiento'),
  ]);

    return [
    ...(aguaB || []).map(e => ({ tipo: 'Agua Bacteriológico', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(aguaF || []).map(e => ({ tipo: 'Agua Físico-Químico', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(patData || []).map(e => ({ tipo: 'PAT', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(aspData || []).map(e => ({ tipo: 'ASP', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(capData || []).map(e => ({ tipo: 'Capacitaciones', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(certificadoRedIncendioData || []).map(e => ({ tipo: 'Certificado Red Incendio', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(iluruidoData || []).map(e => ({ tipo: 'Iluminación y Ruido', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(ergoData || []).map(e => ({ tipo: 'Ergonómico', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(artData || []).map(e => ({ tipo: 'ART', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(vibraData || []).map(e => ({ tipo: 'Vibración', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(antiData || []).map(e => ({ tipo: 'Antisinestral', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(verifData || []).map(e => ({ tipo: 'Verificación', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(humoData || []).map(e => ({ tipo: 'Estudio de Humo', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(eppData || []).map(e => ({ tipo: 'Entrega EPP', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(residuosEspecialesData || []).map(e => ({ tipo: 'Residuos Especiales', ...normalizeEntregaDocumentacionDoc(e) })),
    ...(termografiaData || []).map(e => ({ tipo: 'Termografía', ...normalizeEntregaDocumentacionDoc(e) })),
  ];

};

module.exports = getTodosLosEstudiosDelMes;
