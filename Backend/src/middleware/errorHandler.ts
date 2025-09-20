import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import messages from '../constants/messages';

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  // Log error stack
  logger.error(err.stack || err.message);

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    message: err.message || messages.GENERAL.ERROR,
    data: null,
  });
};

export default errorHandler;
