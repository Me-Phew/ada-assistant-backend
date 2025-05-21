import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import configuration, {
  LoggerConfig,
  LoggerFormat,
} from './config/configuration';
import { AppConfig } from './config/configuration';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from 'modules/auth/auth.module';
import { UserModule } from 'modules/user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { DataloaderModule } from 'dataloader/dataloader.module';
import { DataloaderService } from 'dataloader/dataloader.service';
import { join } from 'path';
import { formatGraphQLError } from 'common/graphql/errors';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { SpotifyModule } from './modules/spotify/spotify.module';
import { MailModule } from './modules/mail/mail.module';
import { AdminModule } from './modules/admin/admin.module';
import { DeviceModule } from './modules/device/device.module';
import { ConversationModule } from './modules/conversation/conversation.module';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => {
        const loggerConfig = config.get<LoggerConfig>('logger');

        return {
          pinoHttp: {
            level: loggerConfig.level,
            transport:
              loggerConfig.format === LoggerFormat.Pretty
                ? { target: 'pino-pretty' }
                : undefined,
            useLevelLabels: true,
            formatters: {
              level: (label: string) => {
                return { level: label };
              },
            },
            autoLogging: false,
          },
        };
      },
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [DataloaderModule],
      inject: [DataloaderService],
      driver: ApolloDriver,
      useFactory: (dataloaderService: DataloaderService) => {
        return {
          autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
          debug: true,
          playground: true,
          introspection: true,
          formatError: formatGraphQLError,
          context: () => ({
            loaders: dataloaderService.createLoaders(),
          }),
        };
      },
    }),
    DatabaseModule,

    // Http modules
    MailModule,
    AuthModule,
    UserModule,
    HealthModule,
    SpotifyModule,
    AdminModule,
    DeviceModule,
    ConversationModule,
  ],
  providers: [
    Logger,
    // we set all routes to be private by default
    // use `@Public()` to make them public
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    // Roles guard for authorization
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
