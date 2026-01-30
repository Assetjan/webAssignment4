const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const measurementsRouter = require('./routes/measurements')

const app = express()

app.use(express.json({ limit: '1mb' }))
app.use('/api/measurements', measurementsRouter)
app.use(express.static(path.join(__dirname, 'public')))

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  const payload = { error: err.message || 'Internal server error' }
  if (err.details) payload.details = err.details
  res.status(status).json(payload)
})

const port = process.env.PORT ? Number(process.env.PORT) : 3000
const mongoUri = process.env.MONGODB_URI || 'mongodb:' + '/' + '/' + '127.0.0.1:27017/analytics_platform'

mongoose.connect(mongoUri)
  .then(() => {
    app.listen(port, () => {})
  })
  .catch((e) => {
    process.exit(1)
  })
