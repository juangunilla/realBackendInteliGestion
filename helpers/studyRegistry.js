const { AguaBacteriologico } = require('../models/form/aguaBacteriologico');
const { AguaFisicoQuimico } = require('../models/form/aguaFisicoQuimico');
const { Analisis } = require('../models/form/analisist');
const { Antisinestral } = require('../models/form/antisinestral');
const { Art } = require('../models/form/art');
const { Artrgrgl } = require('../models/form/artRGRGL');
const { Asp } = require('../models/form/asp');
const { AspCanerias } = require('../models/form/aspCanerias');
const { AspEnsayo } = require('../models/form/aspEnsayo');
const { AspHidraulica } = require('../models/form/aspHidraulica');
const Capacitacion = require('../models/form/capacitaciones');
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
const Verificacion = require('../models/form/verificacion');
const Vibraciones = require('../models/form/vibracion');

const studyConfigs = [
  { key: 'agua-bacteriologico', label: 'Agua Bacteriológico', model: AguaBacteriologico },
  { key: 'agua-fisicoquimico', label: 'Agua Físico-Químico', model: AguaFisicoQuimico },
  { key: 'analisis', label: 'Análisis', model: Analisis },
  { key: 'antisinestral', label: 'Antisinestral', model: Antisinestral },
  { key: 'art', label: 'ART', model: Art },
  { key: 'art-rgrgl', label: 'ART RGRGL', model: Artrgrgl },
  { key: 'asp', label: 'ASP General', model: Asp },
  { key: 'asp-canerias', label: 'ASP Cañerías', model: AspCanerias },
  { key: 'asp-ensayo', label: 'ASP Ensayo Periódico', model: AspEnsayo },
  { key: 'asp-hidraulica', label: 'ASP Hidráulica', model: AspHidraulica },
  { key: 'capacitaciones', label: 'Capacitaciones', model: Capacitacion },
  { key: 'carga-de-fuego', label: 'Carga de Fuego', model: CargaDeFuego },
  { key: 'contaminante-lab', label: 'Contaminante de Laboratorio', model: ContaminanteLab },
  { key: 'control-extintor', label: 'Control de Extintores', model: ControlExtintor },
  { key: 'cronoc', label: 'Cronograma C', model: Cronoc },
  { key: 'cronot', label: 'Cronograma T', model: Cronot },
  { key: 'entrega-epp', label: 'Entrega EPP', model: EntregaEpp },
  { key: 'ergonomico', label: 'Ergonómico', model: Ergonomico },
  { key: 'estudio-humo', label: 'Estudio de Humo', model: EstudioHumo },
  { key: 'iluminacion-ruido', label: 'Iluminación y Ruido', model: IluminacionRuido },
  { key: 'leysap', label: 'Ley SAP', model: LeySap },
  { key: 'ot', label: 'Orden de Trabajo', model: Ot },
  { key: 'pat', label: 'PAT', model: Pat },
  { key: 'verificacion', label: 'Verificación', model: Verificacion },
  { key: 'vibraciones', label: 'Vibraciones', model: Vibraciones },
];

const getStudyConfig = (identifier = '') => {
  const cleaned = identifier.toLowerCase();
  return (
    studyConfigs.find(
      ({ key, label }) =>
        key === cleaned ||
        key === identifier ||
        label.toLowerCase() === cleaned ||
        label === identifier
    ) || null
  );
};

module.exports = { studyConfigs, getStudyConfig };
