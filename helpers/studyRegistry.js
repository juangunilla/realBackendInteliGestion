const { AguaBacteriologico } = require('../models/form/aguaBacteriologico');
const { AguaFisicoQuimico } = require('../models/form/aguaFisicoQuimico');
const { AnalisisDeRiesgo } = require('../models/form/analisisDeRiesgo');
const { Analisis } = require('../models/form/analisist');
const { Antisinestral } = require('../models/form/antisinestral');
const { Art } = require('../models/form/art');
const { Artrgrgl } = require('../models/form/artRGRGL');
const { Asp } = require('../models/form/asp');
const { AspCanerias } = require('../models/form/aspCanerias');
const { AspEnsayo } = require('../models/form/aspEnsayo');
const { AspHidraulica } = require('../models/form/aspHidraulica');
const {
  CapacitacionAutoelevadorRes96015,
} = require('../models/form/capacitacionAutoelevadorRes96015');
const { capacitacionesEnEmergencias } = require('../models/form/capacitacionEnEmergencias');
const {
  CapacitacionIncendio,
} = require('../models/form/CapacitacionIncendio');
const {
  CapacitacionRiesgoEspecifico,
} = require('../models/form/capacitacionRiesgoEspecifico');
const Capacitacion = require('../models/form/capacitaciones');
const {
  CertificadoRedIncendio,
} = require('../models/form/certificadoRedIncendio');
const CargaDeFuego = require('../models/form/cargaDeFuego');
const ContaminanteLab = require('../models/form/contaminantelab');
const ControlExtintor = require('../models/form/controlExtintor');
const Cronoc = require('../models/form/cronoc');
const Cronot = require('../models/form/cronot');
const EntregaEpp = require('../models/form/entregaepp');
const Ergonomico = require('../models/form/ergonomico');
const EstudioHumo = require('../models/form/estudiohumo');
const IluminacionRuido = require('../models/form/iluminacionyruido');
const LeySap = require('../models/form/leysap');
const Ot = require('../models/form/ot');
const Pat = require('../models/form/pat');
const {
  ResiduosEspeciales,
} = require('../models/form/residuosEspeciales');
const { Termografia } = require('../models/form/termografia');
const Verificacion = require('../models/form/verificacion');
const Vibraciones = require('../models/form/vibracion');

const DEFAULT_STATUS_FIELDS = ['estado', 'estadoVigencia', 'cumplimiento'];
const DEFAULT_DATE_FIELDS = [
  'vencimiento',
  'vencimientoCapacitacion',
  'fechaVencimiento',
  'fecha',
  'fechaMed',
  'fechaCapacitacion',
  'fechaEmision',
];

const normalizeIdentifier = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getFirstPresentValue = (source, fields = []) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  for (const field of fields) {
    const value = source[field];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
};

const studyConfigs = [
  { key: 'agua-bacteriologico', label: 'Agua Bacteriológico', model: AguaBacteriologico, apiPath: '/api/aguabac' },
  { key: 'agua-fisicoquimico', label: 'Agua Físico-Químico', model: AguaFisicoQuimico, apiPath: '/api/fisicoquimico' },
  { key: 'analisis', label: 'Análisis', model: Analisis, apiPath: '/api/analisist' },
  {
    key: 'analisis-de-riesgo',
    label: 'Análisis de Riesgo',
    model: AnalisisDeRiesgo,
    apiPath: '/api/analisisderiesgo',
    aliases: ['analisis-de-riego', 'analisisderiesgo', 'analisisderiego'],
  },
  { key: 'antisinestral', label: 'Antisinestral', model: Antisinestral, apiPath: '/api/antisinestral' },
  { key: 'art', label: 'ART', model: Art, apiPath: '/api/art' },
  { key: 'art-rgrgl', label: 'ART RGRGL', model: Artrgrgl, apiPath: '/api/artrgrgl' },
  { key: 'asp', label: 'ASP General', model: Asp, apiPath: '/api/asp' },
  { key: 'asp-canerias', label: 'ASP Cañerías', model: AspCanerias, apiPath: '/api/asp/canerias' },
  { key: 'asp-ensayo', label: 'ASP Ensayo Periódico', model: AspEnsayo, apiPath: '/api/asp/ensayo' },
  { key: 'asp-hidraulica', label: 'ASP Hidráulica', model: AspHidraulica, apiPath: '/api/asp/hidraulica' },
  { key: 'capacitaciones', label: 'Capacitaciones', model: Capacitacion, apiPath: '/api/capacitaciones' },
  {
    key: 'capacitacion-riesgo-especifico',
    label: 'Capacitación Riesgo Específico',
    model: CapacitacionRiesgoEspecifico,
    apiPath: '/api/capacitacionriesgoespecifico',
    statusFields: ['estadoVigencia', 'estado'],
    dateFields: ['vencimientoCapacitacion', 'fechaCapacitacion', 'vencimiento'],
    aliases: ['capacitacionriesgoespecifico'],
  },
  {
    key: 'capacitacion-incendio',
    label: 'Capacitación Incendio',
    model: CapacitacionIncendio,
    apiPath: '/api/capacitacionincendio',
    statusFields: ['estadoVigencia', 'estado'],
    dateFields: ['vencimientoCapacitacion', 'fechaCapacitacion', 'vencimiento'],
    aliases: ['capacitacionincendio'],
  },
  {
    key: 'capacitacion-autoelevador-res96015',
    label: 'Capacitación Autoelevador Res. 960/15',
    model: CapacitacionAutoelevadorRes96015,
    apiPath: '/api/capacitacionautoelevadorres96015',
    statusFields: ['estadoVigencia', 'estado'],
    dateFields: ['vencimientoCapacitacion', 'fechaCapacitacion', 'vencimiento'],
    aliases: ['capacitacionautoelevadorres96015'],
  },
  {
    key: 'capacitacion-emergencias',
    label: 'Capacitación en Emergencias',
    model: capacitacionesEnEmergencias,
    apiPath: '/api/capacitacionemergencias',
    statusFields: ['estadoVigencia', 'estado'],
    dateFields: ['vencimientoCapacitacion', 'fechaCapacitacion', 'vencimiento'],
    aliases: ['capacitacionemergencias'],
  },
  {
    key: 'carga-de-fuego',
    label: 'Carga de Fuego',
    model: CargaDeFuego,
    apiPath: '/api/cargadefuego',
    dateFields: ['vencimiento'],
  },
  {
    key: 'certificado-red-incendio',
    label: 'Certificado Red Incendio',
    model: CertificadoRedIncendio,
    apiPath: '/api/certificadoredincendio',
    dateFields: ['vencimiento'],
    aliases: ['certificadoredincendio'],
  },
  { key: 'contaminante-lab', label: 'Contaminante de Laboratorio', model: ContaminanteLab, apiPath: '/api/contaminantelabs' },
  { key: 'control-extintor', label: 'Control de Extintores', model: ControlExtintor, apiPath: '/api/controlextintor' },
  { key: 'cronoc', label: 'Cronograma C', model: Cronoc, apiPath: '/api/cronoc' },
  { key: 'cronot', label: 'Cronograma T', model: Cronot, apiPath: '/api/cronot' },
  { key: 'entrega-epp', label: 'Entrega EPP', model: EntregaEpp, apiPath: '/api/entregaepp' },
  { key: 'ergonomico', label: 'Ergonómico', model: Ergonomico, apiPath: '/api/ergonomico' },
  { key: 'estudio-humo', label: 'Estudio de Humo', model: EstudioHumo, apiPath: '/api/estudioh' },
  { key: 'iluminacion-ruido', label: 'Iluminación y Ruido', model: IluminacionRuido, apiPath: '/api/iluminacionyruido' },
  { key: 'leysap', label: 'Ley SAP', model: LeySap, apiPath: '/api/leysap', dateFields: ['fechaVencimiento', 'vencimiento'] },
  {
    key: 'ot',
    label: 'Orden de Trabajo',
    model: Ot,
    apiPath: '/api/ot',
    dateFields: ['fecha', 'vencimiento'],
    assignmentField: 'asignado',
  },
  { key: 'pat', label: 'PAT', model: Pat, apiPath: '/api/pat' },
  {
    key: 'residuos-especiales',
    label: 'Residuos Especiales',
    model: ResiduosEspeciales,
    apiPath: '/api/residuosespeciales',
    aliases: ['residuosespeciales'],
  },
  { key: 'termografia', label: 'Termografía', model: Termografia, apiPath: '/api/termografia', dateFields: ['vencimiento', 'fechaEmision'] },
  { key: 'verificacion', label: 'Verificación', model: Verificacion, apiPath: '/api/verificacion' },
  { key: 'vibraciones', label: 'Vibraciones', model: Vibraciones, apiPath: '/api/vibracion' },
];

const getStudyConfig = (identifier = '') => {
  const cleaned = normalizeIdentifier(identifier);
  return (
    studyConfigs.find(
      ({ key, label, aliases = [] }) =>
        [key, label, ...aliases].some((candidate) => normalizeIdentifier(candidate) === cleaned)
    ) || null
  );
};

const resolveStudyStatus = (config = {}, study = {}) =>
  getFirstPresentValue(study, [...(config.statusFields || []), ...DEFAULT_STATUS_FIELDS]);

const getStudyDateFields = (config = {}) => {
  if (Array.isArray(config.dateFields) && config.dateFields.length > 0) {
    return [...new Set(config.dateFields)];
  }

  return [...DEFAULT_DATE_FIELDS];
};

const getStudyAssignmentField = (config = {}) => config.assignmentField || 'profesional';

const resolveStudyDueDate = (config = {}, study = {}) =>
  getFirstPresentValue(study, getStudyDateFields(config));

const resolveStudyEditPath = (config = {}, studyId) =>
  config.apiPath && studyId ? `${config.apiPath}/${studyId}` : null;

module.exports = {
  getStudyAssignmentField,
  getStudyConfig,
  getStudyDateFields,
  resolveStudyDueDate,
  resolveStudyEditPath,
  resolveStudyStatus,
  studyConfigs,
};
