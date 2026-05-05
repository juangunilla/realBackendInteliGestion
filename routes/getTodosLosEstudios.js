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
    ...(aguaB || []).map(e => ({ tipo: 'Agua Bacteriológico', ...e._doc })),
    ...(aguaF || []).map(e => ({ tipo: 'Agua Físico-Químico', ...e._doc })),
    ...(patData || []).map(e => ({ tipo: 'PAT', ...e._doc })),
    ...(aspData || []).map(e => ({ tipo: 'ASP', ...e._doc })),
    ...(capData || []).map(e => ({ tipo: 'Capacitaciones', ...e._doc })),
    ...(certificadoRedIncendioData || []).map(e => ({ tipo: 'Certificado Red Incendio', ...e._doc })),
    ...(iluruidoData || []).map(e => ({ tipo: 'Iluminación y Ruido', ...e._doc })),
    ...(ergoData || []).map(e => ({ tipo: 'Ergonómico', ...e._doc })),
    ...(artData || []).map(e => ({ tipo: 'ART', ...e._doc })),
    ...(vibraData || []).map(e => ({ tipo: 'Vibración', ...e._doc })),
    ...(antiData || []).map(e => ({ tipo: 'Antisinestral', ...e._doc })),
    ...(verifData || []).map(e => ({ tipo: 'Verificación', ...e._doc })),
    ...(humoData || []).map(e => ({ tipo: 'Estudio de Humo', ...e._doc })),
    ...(eppData || []).map(e => ({ tipo: 'Entrega EPP', ...e._doc })),
    ...(residuosEspecialesData || []).map(e => ({ tipo: 'Residuos Especiales', ...e._doc })),
    ...(termografiaData || []).map(e => ({ tipo: 'Termografía', ...e._doc })),
  ];

};

module.exports = getTodosLosEstudiosDelMes;
