// controllers/capacitacionesEnEmergencias.emergencias.controller.js
const { capacitacionesEnEmergencias } = require("../../models/form/capacitacionEnEmergencias");
const { registrarAccion } = require('../../helpers/auditHelper');
const { normalizeFechaDerivadoPayload } = require('../../helpers/fechaDerivado');

const ENTITY = 'capacitacion_en_emergencias';

function normalizeRootPayload(payload = {}) {
  const normalized = normalizeFechaDerivadoPayload({ ...payload });

  if (normalized.cliente) {
    normalized.cliente = Array.isArray(normalized.cliente)
      ? normalized.cliente[0]
      : normalized.cliente;
  }

  if (normalized.establecimiento) {
    normalized.establecimiento = Array.isArray(normalized.establecimiento)
      ? normalized.establecimiento[0]
      : normalized.establecimiento;
  }

  return normalized;
}

exports.getItems = async (req, res) => {
  try {
    const data = await capacitacionesEnEmergencias.find({});
    return res.json({ status: 'success', data });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
};

exports.postItem = async (req, res) => {
  try {
    const payload = normalizeRootPayload(req.body);
    const data = await capacitacionesEnEmergencias.create(payload);

    await registrarAccion({
      user: req.user,
      action: 'create',
      entity: ENTITY,
      entityId: data._id,
      description: 'Creación de capacitación en emergencias',
      payload,
    });

    return res.status(201).json({ status: 'success', data });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { _id } = req.params;
    const payload = normalizeRootPayload(req.body);
    const data = await capacitacionesEnEmergencias.findByIdAndUpdate(
      _id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ status: 'error', message: 'No existe el registro' });
    }

    await registrarAccion({
      user: req.user,
      action: 'update',
      entity: ENTITY,
      entityId: _id,
      description: 'Actualización de capacitación en emergencias',
      changes: payload,
    });

    return res.json({ status: 'success', data });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
};

function hhmmToMinutes(hhmm) {
  // "10:05" -> 605
  if (!hhmm || typeof hhmm !== "string") return null;
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function calcDurationMin(inicio, fin) {
  const a = hhmmToMinutes(inicio);
  const b = hhmmToMinutes(fin);
  if (a === null || b === null) return null;
  // si cruzó medianoche, suma 24h
  return b >= a ? b - a : (24 * 60 - a) + b;
}

function buildChecklistBase() {
  return [
    { item: "Activacion de alarma", ok: false, observacion: "" },
    { item: "Evacuacion ordenada", ok: false, observacion: "" },
    { item: "Punto de encuentro definido", ok: false, observacion: "" },
    { item: "Recuento final de personas", ok: false, observacion: "" },
    { item: "Comunicacion interna", ok: false, observacion: "" },
  ];
}

/** =========================
 * ROLES
 * ========================= */

exports.addRol = async (req, res) => {
  try {
    const { id } = req.params; // id del documento capacitacion
    const payload = req.body;

    const doc = await capacitacionesEnEmergencias.findById(id);
    if (!doc) return res.status(404).json({ ok: false, msg: "No existe el registro" });

    doc.planillaRoles.push(payload);
    await doc.save();

    return res.json({ ok: true, planillaRoles: doc.planillaRoles });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
};

exports.updateRol = async (req, res) => {
  try {
    const { id, rolId } = req.params;
    const payload = req.body;

    const doc = await capacitacionesEnEmergencias.findById(id);
    if (!doc) return res.status(404).json({ ok: false, msg: "No existe el registro" });

    const rol = doc.planillaRoles.id(rolId);
    if (!rol) return res.status(404).json({ ok: false, msg: "No existe el rol" });

    Object.assign(rol, payload);
    await doc.save();

    return res.json({ ok: true, planillaRoles: doc.planillaRoles });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
};

exports.deleteRol = async (req, res) => {
  try {
    const { id, rolId } = req.params;

    const doc = await capacitacionesEnEmergencias.findById(id);
    if (!doc) return res.status(404).json({ ok: false, msg: "No existe el registro" });

    const rol = doc.planillaRoles.id(rolId);
    if (!rol) return res.status(404).json({ ok: false, msg: "No existe el rol" });

    rol.deleteOne();
    await doc.save();

    return res.json({ ok: true, planillaRoles: doc.planillaRoles });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
};

/** =========================
 * ORGANIGRAMA
 * ========================= */

exports.setOrganigrama = async (req, res) => {
  try {
    const { id } = req.params;
    const { nodos = [], relaciones = [] } = req.body;

    const doc = await capacitacionesEnEmergencias.findById(id);
    if (!doc) return res.status(404).json({ ok: false, msg: "No existe el registro" });

    // simple validación: relaciones solo entre nodos existentes
    const nodeIds = new Set(nodos.map((n) => n.nodeId));
    const bad = relaciones.find((r) => !nodeIds.has(r.from) || !nodeIds.has(r.to));
    if (bad) return res.status(400).json({ ok: false, msg: "Relación inválida: from/to no existe" });

    doc.organigramaRoles = { nodos, relaciones };
    await doc.save();

    return res.json({ ok: true, organigramaRoles: doc.organigramaRoles });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
};

/** =========================
 * SIMULACROS
 * ========================= */

exports.createSimulacro = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const doc = await capacitacionesEnEmergencias.findById(id);
    if (!doc) return res.status(404).json({ ok: false, msg: "No existe el registro" });

    const simulacro = {
      fecha: payload.fecha || new Date(),
      tipo: payload.tipo || "Evacuación",
      responsable: payload.responsable || null,
      horaInicio: payload.horaInicio || "",
      horaFin: payload.horaFin || "",
      tiempoTotalMin: calcDurationMin(payload.horaInicio, payload.horaFin),
      participantesCantidad: payload.participantesCantidad ?? null,
      recuentoFinalOk: payload.recuentoFinalOk ?? true,
      comentarios: payload.comentarios || "",
      checklist: payload.checklist?.length ? payload.checklist : buildChecklistBase(),
      evidencias: payload.evidencias || [],
      accionesCorrectivas: payload.accionesCorrectivas || [],
    };

    doc.informesSimulacro.push(simulacro);
    await doc.save();

    return res.json({ ok: true, informesSimulacro: doc.informesSimulacro });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
};

exports.updateSimulacro = async (req, res) => {
  try {
    const { id, simulacroId } = req.params;
    const payload = req.body || {};

    const doc = await capacitacionesEnEmergencias.findById(id);
    if (!doc) return res.status(404).json({ ok: false, msg: "No existe el registro" });

    const sim = doc.informesSimulacro.id(simulacroId);
    if (!sim) return res.status(404).json({ ok: false, msg: "No existe el simulacro" });

    Object.assign(sim, payload);

    // recalcular duración si tocaron horas
    if ("horaInicio" in payload || "horaFin" in payload) {
      sim.tiempoTotalMin = calcDurationMin(sim.horaInicio, sim.horaFin);
    }

    await doc.save();
    return res.json({ ok: true, informesSimulacro: doc.informesSimulacro });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
};

exports.deleteSimulacro = async (req, res) => {
  try {
    const { id, simulacroId } = req.params;

    const doc = await capacitacionesEnEmergencias.findById(id);
    if (!doc) return res.status(404).json({ ok: false, msg: "No existe el registro" });

    const sim = doc.informesSimulacro.id(simulacroId);
    if (!sim) return res.status(404).json({ ok: false, msg: "No existe el simulacro" });

    sim.deleteOne();
    await doc.save();

    return res.json({ ok: true, informesSimulacro: doc.informesSimulacro });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
};
