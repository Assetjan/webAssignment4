const mongoose = require('mongoose')

const measurementSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    field1: { type: Number },
    field2: { type: Number },
    field3: { type: Number }
  },
  { versionKey: false }
)

measurementSchema.index({ timestamp: 1 })

module.exports = mongoose.model('Measurement', measurementSchema, 'measurements')
