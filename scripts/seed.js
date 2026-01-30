const mongoose = require('mongoose')
const Measurement = require('../models/Measurement')

const mongoUri = process.env.MONGODB_URI || 'mongodb:' + '/' + '/' + '127.0.0.1:27017/analytics_platform'

function randNormal(mean, std) {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return mean + z * std
}

async function run() {
  await mongoose.connect(mongoUri)

  const now = new Date()
  const hours = 24 * 30
  const docs = []
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000)
    const dayFactor = Math.sin((t.getTime() / (1000 * 60 * 60 * 24)) * 2 * Math.PI / 7)
    const field1 = randNormal(20 + 3 * dayFactor, 0.8)
    const field2 = randNormal(55 - 10 * dayFactor, 2.2)
    const field3 = randNormal(420 + 40 * dayFactor, 6.5)
    docs.push({
      timestamp: t,
      field1: Number(field1.toFixed(3)),
      field2: Number(field2.toFixed(3)),
      field3: Number(field3.toFixed(3))
    })
  }

  await Measurement.deleteMany({})
  await Measurement.insertMany(docs)
  await mongoose.disconnect()
}

run().catch(() => process.exit(1))
