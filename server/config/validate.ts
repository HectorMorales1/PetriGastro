import { validationResult, ValidationChain } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/errorHandler'

const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map(v => v.run(req)))
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const messages = errors.array().map(e => e.msg).join(', ')
      return next(new AppError(messages, 400))
    }
    next()
  }
}

export { validate }
