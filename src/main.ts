import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
    const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('User Auth, Role Guard, Email Verification')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

      app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // strips non-decorated fields
      forbidNonWhitelisted: true,
      transform: true,        // transforms payloads to DTO instances
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
