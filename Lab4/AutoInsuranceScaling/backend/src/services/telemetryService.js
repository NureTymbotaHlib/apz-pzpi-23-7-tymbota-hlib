const TelemetryEvent = require('../models/TelemetryEvent')
const SystemSettings = require('../models/SystemSettings')

const httpError = (status, message) => {
    const err = new Error(message)
    err.status = status
    return err
}

const getImpactSpeedThreshold = async () => {
    const row = await SystemSettings.findOne({ key: 'impactSpeedThreshold' }).lean()
    if (row && Number.isFinite(row.valueNumber)) return row.valueNumber
    return 30
}

const getNextEventId = async () => {
    const last = await TelemetryEvent.findOne({}).sort({ event_id: -1 }).lean()
    return last ? last.event_id + 1 : 1
}

exports.createTelemetryEvent = async (data) => {
    const {
        event_id,
        vehicle_id,
        timestamp,
        speed,
        engine_rpm,
        acceleration,
        braking_flag,
        impact_flag,
        latitude,
        longitude
    } = data

    if (!vehicle_id || !timestamp) {
        throw httpError(400, 'Required fields: vehicle_id, timestamp')
    }

    const ts = new Date(timestamp)
    if (Number.isNaN(ts.getTime())) throw httpError(400, 'Invalid timestamp')

    const threshold = await getImpactSpeedThreshold()
    const speedNum = Number(speed || 0)

    const severity =
        impact_flag === true && speedNum >= threshold
            ? 'critical'
            : 'normal'

    const finalEventId = Number.isFinite(Number(event_id))
        ? Number(event_id)
        : await getNextEventId()

    const event = await TelemetryEvent.create({
        event_id: finalEventId,
        vehicle_id: Number(vehicle_id),
        timestamp: ts,
        speed,
        engine_rpm,
        acceleration,
        braking_flag,
        impact_flag,
        severity,
        latitude,
        longitude
    })

    return event
}