import mongoose from 'mongoose';
import logger from './logger';
import messages from '../constants/messages';
import config from './config';

const { MONGO_URI } = config;

const { DATABASE } = messages;

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = MONGO_URI as string;

    if (!mongoURI) {
      throw new Error(DATABASE.URI_NOTFOUND);
    }

    await mongoose.connect(mongoURI);

    logger.info(DATABASE.CONNECTED);
  } catch (error) {
    logger.error(`${DATABASE.CONNECTION_FAILED}: ${(error as Error).message}`);
    process.exit(1);
  }

  mongoose.connection.on('connected', () => {
    logger.info(DATABASE.CONNECTED);
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`${DATABASE.ERROR}: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn(DATABASE.DISCONNECTED);
  });
};

export default connectDB;
