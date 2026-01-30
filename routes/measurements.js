const express = require('express')
const Measurement = require('../models/Measurement')
const { parseDateParam, validateField, buildDateMatch, parsePagination } = require('./utils')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const field = validateField(req.query.field)
    const startDate = parseDateParam(req.query.start_date, 'start_date')
    const endDate = parseDateParam(req.query.end_date, 'end_date')
    if (startDate && endDate && startDate > endDate) {
      const err = new Error('start_date must be <= end_date')
      err.statusCode = 400
      throw err
    }
    const { page, limit, skip } = parsePagination(req.query)
    const match = buildDateMatch(startDate, endDate)
    const project = { timestamp: 1 }
    project[field] = 1

    const [rows, total] = await Promise.all([
      Measurement.find(match).select(project).sort({ timestamp: 1 }).skip(skip).limit(limit).lean(),
      Measurement.countDocuments(match)
    ])

    if (!rows.length) {
      res.status(404).json({ error: 'No data in the specified range' })
      return
    }

    res.json({
      meta: { field, page, limit, total },
      data: rows.map(r => ({ timestamp: r.timestamp, [field]: r[field] }))
    })
  } catch (e) {
    next(e)
  }
})

router.get('/metrics', async (req, res, next) => {
  try {
    const field = validateField(req.query.field)
    const startDate = parseDateParam(req.query.start_date, 'start_date')
    const endDate = parseDateParam(req.query.end_date, 'end_date')
    if (startDate && endDate && startDate > endDate) {
      const err = new Error('start_date must be <= end_date')
      err.statusCode = 400
      throw err
    }
    const match = buildDateMatch(startDate, endDate)
    match[field] = { $ne: null }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avg: { $avg: `$${field}` },
          min: { $min: `$${field}` },
          max: { $max: `$${field}` },
          stdDev: { $stdDevPop: `$${field}` }
        }
      },
      {
        $project: {
          _id: 0,
          count: 1,
          avg: { $round: ['$avg', 6] },
          min: { $round: ['$min', 6] },
          max: { $round: ['$max', 6] },
          stdDev: { $round: ['$stdDev', 6] }
        }
      }
    ]

    const result = await Measurement.aggregate(pipeline)
    if (!result.length) {
      res.status(404).json({ error: 'No data in the specified range' })
      return
    }
    res.json({ field, range: { start_date: startDate, end_date: endDate }, ...result[0] })
  } catch (e) {
    next(e)
  }
})

module.exports = router
