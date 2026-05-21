const { validationResult } = require('express-validator')
const { AppError } = require('../middleware/errorHandler')

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)))
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const messages = errors.array().map(e => e.msg).join(', ')
      return next(new AppError(messages, 400))
    }
    next()
  }
}

module.exports = { validate }