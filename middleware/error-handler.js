const errorHandler = (err, req, res, next) => {
  console.error("❌ Error en middleware:", err.message)
  console.error("Stack:", err.stack)

  // Don't crash the server, just return error response
  if (res.headersSent) {
    return next(err)
  }

  const statusCode = err.statusCode || 500
  const message = err.message || "Error interno del servidor"

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  })
}

// Async error wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = { errorHandler, asyncHandler }
