// routes/capacitacionesEnEmergencias.emergencias.routes.js
const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/form/capacitacionEnEmergencias");

router.get("/", ctrl.getItems);
router.post("/", ctrl.postItem);
router.put("/:_id", ctrl.updateItem);

// ROLES
router.post("/:id/emergencias/roles", ctrl.addRol);
router.put("/:id/emergencias/roles/:rolId", ctrl.updateRol);
router.delete("/:id/emergencias/roles/:rolId", ctrl.deleteRol);

// ORGANIGRAMA
router.put("/:id/emergencias/organigrama", ctrl.setOrganigrama);

// SIMULACROS
router.post("/:id/emergencias/simulacros", ctrl.createSimulacro);
router.put("/:id/emergencias/simulacros/:simulacroId", ctrl.updateSimulacro);
router.delete("/:id/emergencias/simulacros/:simulacroId", ctrl.deleteSimulacro);

module.exports = router;
