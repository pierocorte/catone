import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as OpenApiValidator from 'express-openapi-validator';

async function bootstrap() {
  const server = express();

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser());

  // CORS (ok anche con curl senza Origin)
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:3002')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  server.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      maxAge: 86400,
    }),
  );

  const apiSpecPath = join(process.cwd(), 'openapi', 'openapi.yaml');
  const apiSpecRaw = readFileSync(apiSpecPath, 'utf8');
  const apiSpecDoc = YAML.parse(apiSpecRaw);

  server.get('/openapi.yaml', (_req, res) => res.type('text/yaml').send(apiSpecRaw));
  server.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpecDoc));

  // OpenAPI validator BEFORE Nest routes
  server.use(
    OpenApiValidator.middleware({
      apiSpec: apiSpecPath,
      validateRequests: true,
      validateResponses: true,
    }),
  );

  // Mount Nest routes
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.init();

  // IMPORTANT: error handler MUST be last (after routes)
  server.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  });

  await app.listen(3001);
}

bootstrap();
