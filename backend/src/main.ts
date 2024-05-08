import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://onlab-frontend-ten.vercel.app/'],
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // used for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipMissingProperties: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
