import { Logger } from '@nestjs/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import postgresConfig from './config/postgres.config';
import { VideoModule } from './video/video.module';
import { AuthModule } from './auth/auth.module';
import jwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RedisModule } from '@nestjs-modules/ioredis';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: 'redis://127.0.0.1:6379',  
        options: {
          password: process.env.REDIS_PASSWORD
        }
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig],
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let obj: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          database: configService.get('postgres.database'),
          username: configService.get('postgres.username'),
          password: configService.get('postgres.password'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: false,
          synchronize: false
        };

        if (configService.get('NODE_ENV') === 'development' || 'test') {
          obj = Object.assign(obj, {
            //엔티티 변경 사항을 자동으로 데이터베이스 스키마에 반영
            // typeORM migration 사용 -> synchronize : false
            // synchronize: true,
            logging: true,
          });
        }
        return obj;
      },
    }),
    UserModule,
    VideoModule,
    AuthModule,
    JwtModule
  ],
  controllers: [],
  providers: [
    Logger,
    {
      //모든 요청에 대해 전역적으로 JwtAuth 인증 수행
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(LoggingMiddleware)
        .forRoutes('*');
  }
}
