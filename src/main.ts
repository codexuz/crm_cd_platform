import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Serve uploads folder for media files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // Allow but strip extra properties
    }),
  );

  // Global class serializer interceptor to handle @Exclude() decorators
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get('Reflector')),
  );

  // CORS configuration for production frontend
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'https://mockmee.uz',
        'https://backend.mockmee.uz',
        'https://teacher.mockmee.uz',
        'https://platform.mockmee.uz',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
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
  console.log(
    `🔐 Login page available at: http://localhost:${port}/login.html`,
  );
  console.log(
    `📝 Register page available at: http://localhost:${port}/register.html`,
  );
}
bootstrap();
