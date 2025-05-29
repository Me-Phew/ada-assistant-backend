// Define the app config here

import { cleanEnv, num, port, str, url } from 'envalid';
import { join } from 'path';

// You can inject it to anywhere via ConfigService
export interface AppConfig {
  port: number;
  secret: string;
  database: DatabaseConfig;
  logger: LoggerConfig;
  isDevEnv: boolean;
  corsMaxAge: number;
  corsAllowedOrigins: string[];
  recordingsDir: string;
  responsesDir: string;
  musicDir: string;
  recordingsPath: string;
  responsesPath: string;
  musicPath: string;
  spotify: SpotifyConfig;
  mail: MailConfig;
  appUrl: string;
  frontendUrl: string;
  aiBackendUrl: string;
}

export interface DatabaseConfig {
  url: string;
  poolSize: number;
}

export enum LoggerFormat {
  Json = 'json',
  Pretty = 'pretty',
}

export interface LoggerConfig {
  level: string;
  format: LoggerFormat;
}

export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export default (): AppConfig => {
  const env = cleanEnv(process.env, {
    SECRET: str(),
    PORT: port({ default: 3000 }),
    DATABASE_URL: url(),
    POOL_SIZE: num({ default: 15 }),
    LOGGER_LEVEL: str({
      choices: ['info', 'debug', 'error', 'warn'],
      default: 'info',
    }),
    LOGGER_FORMAT: str({ choices: ['json', 'pretty'], default: 'json' }),
    CORS_MAX_AGE: num({ default: 86400 }),
    CORS_ALLOWED_ORIGINS: str({
      default:
        'http://localhost:3000,http://localhost:8080,http://127.0.0.1:44809',
    }),
    RECORDINGS_DIR: str({ default: 'recordings' }),
    RESPONSES_DIR: str({ default: 'responses' }),
    MUSIC_DIR: str({ default: 'music' }),
    SPOTIFY_CLIENT_ID: str(),
    SPOTIFY_CLIENT_SECRET: str(),
    SPOTIFY_REDIRECT_URI: str({
      default: 'http://127.0.0.1:38369/spotifycallback',
    }),
    MAIL_HOST: str({ default: 'sandbox.smtp.mailtrap.io' }),
    MAIL_PORT: num({ default: 2525 }),
    MAIL_USER: str({ default: '' }),
    MAIL_PASSWORD: str({ default: '' }),
    MAIL_FROM: str({ default: 'noreply@adavoice.com' }),
    APP_URL: str({ default: 'http://localhost:3001' }),
    FRONTEND_URL: str({ default: 'http://localhost:3000' }),
    AI_BACKEND_URL: str({
      default: 'http://localhost:9000/',
    }),
  });

  const config: AppConfig = {
    port: env.PORT,
    secret: env.SECRET,
    database: {
      url: env.DATABASE_URL,
      poolSize: env.POOL_SIZE || 15,
    },
    logger: {
      level: env.LOGGER_LEVEL || 'info',
      format: (env.LOGGER_FORMAT as LoggerFormat) || LoggerFormat.Json,
    },
    isDevEnv: env.isDev,
    corsMaxAge: env.CORS_MAX_AGE,
    corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS.split(','),
    recordingsDir: env.RECORDINGS_DIR,
    responsesDir: env.RESPONSES_DIR,
    musicDir: env.MUSIC_DIR,
    recordingsPath: join(__dirname, '../../..', env.RECORDINGS_DIR),
    responsesPath: join(__dirname, '../../..', env.RESPONSES_DIR),
    musicPath: join(__dirname, '../../..', env.MUSIC_DIR),
    spotify: {
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      redirectUri: env.SPOTIFY_REDIRECT_URI,
    },
    mail: {
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      user: env.MAIL_USER,
      password: env.MAIL_PASSWORD,
      from: env.MAIL_FROM,
    },
    appUrl: env.APP_URL,
    frontendUrl: env.FRONTEND_URL,
    aiBackendUrl: env.AI_BACKEND_URL,
  };

  return config;
};
