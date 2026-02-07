import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  openai: {
    apiKey: string;
    model: string;
  };
  corsOrigin: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    openai: {
      apiKey: requireEnv('OPENAI_API_KEY'),
      model: process.env.OPENAI_MODEL || 'gpt-5.2',
    },
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  };
}
