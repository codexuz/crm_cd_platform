import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('CRM + IELTS Platform API')
    .setDescription(
      'A comprehensive CRM and Computer-delivered IELTS platform for learning centers',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Centers', 'Learning center management')
    .addTag('Users', 'User management')
    .addTag('Leads', 'Lead management and CRM')
    .addTag('Groups', 'Student groups management')
    .addTag('Payments', 'Payment management')
    .addTag('Salary', 'Teacher salary management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(
    `🚀 CRM + IELTS Platform is running on: http://localhost:${port}`,
  );
  console.log(
    `📚 Swagger documentation available at: http://localhost:${port}/api`,
  );
}
bootstrap();
