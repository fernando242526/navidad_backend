import { DataSource } from 'typeorm';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Configuración SSL
const sslConfig = process.env.DATABASE_SSL === 'true' 
  ? { rejectUnauthorized: false } 
  : false;

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: sslConfig,
  entities: [
    isDevelopment 
      ? 'src/**/*.entity{.ts,.js}' 
      : 'dist/**/*.entity{.js,.ts}'
  ],
  migrations: [
    isDevelopment
      ? 'src/database/migrations/*{.ts,.js}'
      : 'dist/database/migrations/*{.js,.ts}'
  ],
  synchronize: false,
  logging: isDevelopment,
});