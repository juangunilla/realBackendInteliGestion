const mongoose = require('mongoose');
const cargaDeFuego = require('../../models/form/cargaDeFuego')
const { registrarAccion } = require('../../helpers/auditHelper');

const DATE_FIELDS = ['fecha', 'vencimiento', 'fechaHabilitacionRelevamiento'];
const REFERENCE_FIELDS = ['revalidacionDe', 'estudioOrigen', 'habilitadoRelevamientoPor'];

const normalizeId = (value) => {
    if (Array.isArray(value)) {
        return normalizeId(value[0])
    }

    if (value && typeof value === 'object') {
        if (mongoose.isValidObjectId(value)) {
            return `${value}`
        }

        const candidate = value._id || value.id
        if (candidate) {
            return normalizeId(candidate)
        }

        return null
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return null
        }

        if (
            (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))
        ) {
            try {
                return normalizeId(JSON.parse(trimmed))
            } catch (error) {
                return trimmed
            }
        }

        return trimmed
    }

    return value ?? null
}

const normalizeDateValue = (value) => {
    if (typeof value !== 'string') {
        return value
    }

    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
}

const normalizePayload = (payload = {}) => {
    const data = { ...payload }

    DATE_FIELDS.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            data[field] = normalizeDateValue(data[field])
        }
    })

    REFERENCE_FIELDS.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            data[field] = normalizeId(data[field])
        }
    })

    if (Object.prototype.hasOwnProperty.call(data, 'cliente')) {
        const clienteId = normalizeId(data.cliente)
        data.cliente = clienteId ? [clienteId] : []
    }

    if (Object.prototype.hasOwnProperty.call(data, 'establecimiento')) {
        const establecimientoId = normalizeId(data.establecimiento)
        data.establecimiento = establecimientoId ? [establecimientoId] : []
    }

    return data
}

const sendValidationError = (res, message) =>
    res.status(400).json({
        status: 'error',
        message,
    })

const toReferenceArray = (value) => {
    if (!Array.isArray(value)) {
        return value
    }

    return value.map((item) => item?._id || item)
}

const postItem = async (req, res) => {
    try {
        const clienteId = normalizeId(req.body?.cliente)
        const establecimientoId = normalizeId(req.body?.establecimiento)
        const invalidFields = []

        if (!mongoose.isValidObjectId(clienteId)) {
            invalidFields.push('cliente')
        }

        if (!mongoose.isValidObjectId(establecimientoId)) {
            invalidFields.push('establecimiento')
        }

        if (invalidFields.length) {
            return sendValidationError(
                res,
                `El campo ${invalidFields.join(' y ')} debe ser un ObjectId válido`
            )
        }

        const payload = normalizePayload({
            ...req.body,
            cliente: clienteId,
            establecimiento: establecimientoId,
        })

        const data = await cargaDeFuego.create(payload)

        return res.status(201).send({
            status: "success",
            data
        })
    } catch (error) {
        console.error('Error al crear Carga de Fuego:', error)

        if (error?.name === 'ValidationError' || error?.name === 'CastError') {
            return sendValidationError(res, error.message)
        }

        return res.status(500).send({
            status: 'error',
            message: 'Error al crear Carga de Fuego',
        })
    }
};

//actualizar items
const updateItem= async(req,res)=>{
    const {_id}=req.params
    try{
        const update = normalizePayload(req.body)
        const invalidFields = []

        if (
            Object.prototype.hasOwnProperty.call(req.body, 'cliente') &&
            !mongoose.isValidObjectId(normalizeId(req.body.cliente))
        ) {
            invalidFields.push('cliente')
        }

        if (
            Object.prototype.hasOwnProperty.call(req.body, 'establecimiento') &&
            !mongoose.isValidObjectId(normalizeId(req.body.establecimiento))
        ) {
            invalidFields.push('establecimiento')
        }

        if (invalidFields.length) {
            return sendValidationError(
                res,
                `El campo ${invalidFields.join(' y ')} debe ser un ObjectId válido`
            )
        }

        const actualizado = await cargaDeFuego.findByIdAndUpdate(
            _id,
            { $set:update },
            { new: true, runValidators: true }
        )

        if (!actualizado) {
            return res.status(404).json({
                status: 'error',
                message: 'Carga de Fuego no encontrada',
            })
        }

        res.json({
            status: 'success',
            data: actualizado,
        })
    }catch(error){
        console.error(`Error al  actualizar los  datos del estudio${_id}`,error)
        if (error?.name === 'ValidationError' || error?.name === 'CastError') {
            return sendValidationError(res, error.message)
        }

        res.status(500).send('Error al actualizar los datos')
    }
}

const getItems = async (req, res) => {
    const data = await cargaDeFuego.find({})
    return res.status(200).send({
        status: "success",
        data
    })

};

const crearRevalidacionCargaDeFuego = async (req, res) => {
    const { id } = req.params

    try {
        const estudioBase = await cargaDeFuego.findById(id)

        if (!estudioBase) {
            return res.status(404).json({
                ok: false,
                message: 'Estudio base no encontrado'
            })
        }

        const estudioOrigen = estudioBase.estudioOrigen || estudioBase._id
        const cantidadExistente = await cargaDeFuego.countDocuments({
            $or: [
                { _id: estudioOrigen },
                { estudioOrigen }
            ]
        })

        const nuevoEstudio = await cargaDeFuego.create({
            cliente: toReferenceArray(estudioBase.cliente),
            establecimiento: toReferenceArray(estudioBase.establecimiento),
            entidad: estudioBase.entidad,
            comentario: estudioBase.comentario,
            cheq: estudioBase.cheq,
            revalidacionDe: estudioBase._id,
            estudioOrigen,
            esRevalidacion: true,
            numeroRevalidacion: cantidadExistente,
            estado: 'pendiente'
        })

        return res.status(200).json({
            ok: true,
            estudio: nuevoEstudio
        })
    } catch (error) {
        console.error('Error al crear revalidación de carga de fuego', error)
        return res.status(500).json({
            ok: false,
            message: 'Error al crear revalidación de carga de fuego'
        })
    }
}

const habilitarRelevamientoCargaDeFuego = async (req, res) => {
    const { id } = req.params

    try {
        const estudio = await cargaDeFuego.findById(id)

        if (!estudio) {
            return res.status(404).json({
                status: 'error',
                msg: 'Carga de Fuego no encontrada',
            })
        }

        if (estudio.relevamientoHabilitado) {
            return res.status(200).json({
                status: 'success',
                msg: 'El relevamiento ya estaba habilitado',
                data: estudio,
            })
        }

        const userId = req.user?.id || req.user?._id || null

        estudio.relevamientoHabilitado = true
        estudio.fechaHabilitacionRelevamiento = new Date()
        estudio.habilitadoRelevamientoPor = userId
        await estudio.save()

        await registrarAccion({
            user: req.user,
            action: 'update',
            entity: 'cargaDeFuego',
            entityId: estudio._id,
            description: 'Habilitación de relevamiento de Carga de Fuego',
            changes: {
                relevamientoHabilitado: true,
                fechaHabilitacionRelevamiento: estudio.fechaHabilitacionRelevamiento,
                habilitadoRelevamientoPor: estudio.habilitadoRelevamientoPor,
            },
        })

        return res.status(200).json({
            status: 'success',
            msg: 'Relevamiento habilitado correctamente',
            data: estudio,
        })
    } catch (error) {
        console.error('Error al habilitar relevamiento de carga de fuego', error)
        return res.status(500).json({
            status: 'error',
            msg: 'Error al habilitar relevamiento',
        })
    }
}

module.exports = { getItems, postItem,updateItem, crearRevalidacionCargaDeFuego, habilitarRelevamientoCargaDeFuego }
