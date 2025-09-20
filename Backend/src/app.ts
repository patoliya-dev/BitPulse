import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import logger from './config/logger';
import messages from './constants/messages';
import config from './config/config';
import errorHandler from './middleware/errorHandler';

const { PORT } = config;

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/users', userRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: messages.GENERAL.SUCCESS });
});

app.use(errorHandler);

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    logger.error(
      `${messages.DATABASE.CONNECTION_FAILED}: ${(error as Error).message}`
    );
    process.exit(1);
  });
