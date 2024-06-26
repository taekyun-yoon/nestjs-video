import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');


  //Swagger config
  const config = new DocumentBuilder()
    .setTitle('NestJs-Video project')
    .setDescription('NestJs project API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
    //명시적으로 인증을 해제하기 전까지 swagger에서 변경되어도 인증 유지
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, customOptions);

    //Apply globally ValidationPipe 
    app.useGlobalPipes(
      new ValidationPipe({
        //Apply globally class-transform
        transform: true,
      }),
    );

    const port = 3000;
    await app.listen(3000);
    console.info(`NODE_ENV: ${configService.get('NODE_ENV')}`);
    console.info(`listening on port ${port}`);
}
bootstrap();
