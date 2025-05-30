import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws'; // Import WsAdapter
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AllExceptionsFilter } from 'common/filters/all-exception.filter';
import { existsSync, mkdirSync } from 'fs';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import rawBodyMiddleware from 'utils/rawBody.middleware';
import { AppModule } from './app.module';
import { ValidationException } from './common/exceptions/validation.exception';
import { BaseExceptionsFilter } from './common/filters/base-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    snapshot: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const logger = app.get(Logger);
  const corsMaxAge = configService.get<number>('corsMaxAge');
  const corsAllowedOrigins = configService.get<string[]>('corsAllowedOrigins');

  const helmetContentSecurityPolicy = {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [
        `'self'`,
        `'unsafe-inline'`,
        'unpkg.com',
        'cdn.jsdelivr.net',
        'fonts.googleapis.com',
      ],
      connectSrc: [`'self'`, `unpkg.com`],
      fontSrc: [`'self'`, 'fonts.gstatic.com'],
      imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
      scriptSrc: [
        `'self'`,
        `'unsafe-eval'`,
        `https: 'unsafe-inline'`,
        `cdn.jsdelivr.net`,
        `unpkg.com`,
      ],
    },
  };

  const recordingsPath = configService.get<string>('recordingsPath');
  if (!existsSync(recordingsPath)) {
    mkdirSync(recordingsPath, { recursive: true });
  }
  app.useStaticAssets(recordingsPath, {
    prefix: `/${configService.get<string>('recordingsDir')}/`,
  });
  console.log(`Recordings directory initialized at: ${recordingsPath}`);

  const responsesPath = configService.get<string>('responsesPath');
  if (!existsSync(responsesPath)) {
    mkdirSync(responsesPath, { recursive: true });
  }
  app.useStaticAssets(responsesPath, {
    prefix: `/${configService.get<string>('responsesDir')}/`,
  });
  console.log(`Responses directory initialized at: ${responsesPath}`);

  const musicPath = configService.get<string>('musicPath');
  if (!existsSync(musicPath)) {
    mkdirSync(musicPath, { recursive: true });
  }
  app.useStaticAssets(musicPath, {
    prefix: `/${configService.get<string>('musicDir')}/`,
    maxAge: 0,
    immutable: false,
  });
  console.log(`Music directory initialized at: ${musicPath}`);

  app.useWebSocketAdapter(new WsAdapter(app));

  app.useLogger(app.get(Logger));
  app.use(
    helmet({
      contentSecurityPolicy: helmetContentSecurityPolicy,
    }),
    rawBodyMiddleware({}),
  );

  // FOR TESTING ONLY!!!
  app.enableCors({
    origin: (origin, callback) => {
      console.log('Origin attempting to connect:', origin);

      if (!origin) {
        callback(null, true);
        return;
      }

      if (corsAllowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked origin:', origin);
        console.log('Allowed origins:', corsAllowedOrigins);
        callback(null, false);
      }
    },
    maxAge: corsMaxAge,
    credentials: true,
  });

  // app.enableCors({
  //   origin: corsAllowedOrigins,
  //   maxAge: corsMaxAge,
  // });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new AllExceptionsFilter(), new BaseExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new ValidationException(errors);
      },
      transform: true,
      whitelist: true,
      validationError: { target: false },
    }),
  );

  app.setGlobalPrefix('api');

  const openApiConfig = new DocumentBuilder()
    .setTitle('Ada Voice Assistant API')
    .setDescription('Ada Voice Assistant API')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, 'Local')
    .setExternalDoc(
      'For Validation Errors please check class-validator',
      'https://github.com/typestack/class-validator#validation-errors',
    )
    .addBearerAuth()
    .addGlobalParameters({
      in: 'path',
      name: 'X-Api-Version',
      required: false,
      description: 'API Version',
    })
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api-docs', app, document, {
    ui: false,
  });

  app.use('/api-docs', apiReference({ content: document }));

  await app.listen(port, () => {
    logger.log(`Application started at port:${port}`);
  });
}
bootstrap();
