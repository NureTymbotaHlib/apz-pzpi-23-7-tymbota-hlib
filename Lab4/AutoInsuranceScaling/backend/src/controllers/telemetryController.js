const telemetryService = require('../services/telemetryService')

exports.createTelemetryEvent = async (req, res) => {
    try {
        const event = await telemetryService.createTelemetryEvent(req.body)
        res.status(201).json(event)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}