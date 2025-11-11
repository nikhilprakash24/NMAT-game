import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
  };

  // Session
  session: {
    secret: string;
    ttl: number; // in seconds
  };

  // CORS
  cors: {
    origins: string[];
  };

  // Logging
  logging: {
    level: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'nmat_game',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    ttl: parseInt(process.env.SESSION_TTL || '86400', 10),
  },

  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
