import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './error.middleware';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new AppError(message, 400);
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new AppError(message, 400);
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new AppError(message, 400);
    }

    next();
  };
};
