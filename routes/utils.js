const allowedFields = new Set(['field1', 'field2', 'field3'])

function parseDateParam(value, name) {
  if (!value) return null
  const isoLike = value.includes('T') || value.includes(':')
  let d
  if (isoLike) d = new Date(value)
  else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const err = new Error(`Invalid ${name} format. Use YYYY-MM-DD or ISO date`)
      err.statusCode = 400
      throw err
    }
    d = new Date(`${value}T00:00:00.000Z`)
  }
  if (Number.isNaN(d.getTime())) {
    const err = new Error(`Invalid ${name} value`)
    err.statusCode = 400
    throw err
  }
  return d
}

function validateField(field) {
  if (!field) {
    const err = new Error('Missing field parameter')
    err.statusCode = 400
    throw err
  }
  if (!allowedFields.has(field)) {
    const err = new Error(`Invalid field name. Allowed: ${Array.from(allowedFields).join(', ')}`)
    err.statusCode = 400
    throw err
  }
  return field
}

function buildDateMatch(startDate, endDate) {
  const match = {}
  if (startDate || endDate) {
    match.timestamp = {}
    if (startDate) match.timestamp.$gte = startDate
    if (endDate) match.timestamp.$lte = endDate
  }
  return match
}

function parsePagination(query) {
  const pageRaw = query.page
  const limitRaw = query.limit
  const page = pageRaw ? Number(pageRaw) : 1
  const limit = limitRaw ? Number(limitRaw) : 200
  if (!Number.isFinite(page) || page < 1 || Math.floor(page) !== page) {
    const err = new Error('Invalid page. Use a positive integer')
    err.statusCode = 400
    throw err
  }
  if (!Number.isFinite(limit) || limit < 1 || limit > 5000 || Math.floor(limit) !== limit) {
    const err = new Error('Invalid limit. Use an integer between 1 and 5000')
    err.statusCode = 400
    throw err
  }
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

module.exports = {
  allowedFields,
  parseDateParam,
  validateField,
  buildDateMatch,
  parsePagination
}
