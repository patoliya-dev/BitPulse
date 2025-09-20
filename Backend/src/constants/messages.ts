const messages = {
  GENERAL: {
    SUCCESS: '✅ Operation successful',
    ERROR: '❌ Something went wrong',
  },

  DATABASE: {
    CONNECTED: '✅ MongoDB connected successfully',
    CONNECTION_FAILED: '❌ MongoDB connection failed',
    DISCONNECTED: '🔌 MongoDB disconnected',
    ERROR: '⚠️ MongoDB connection error',
    URI_NOTFOUND: 'MONGO_URI is not defined in .env file',
  },

  USER: {
    ALREADY_EXISTS: 'User already exists',
    REGISTERED: 'User registered successfully',
    NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    LOGIN_SUCCESS: 'Login successful',
  },
};

export default messages;
