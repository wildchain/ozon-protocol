import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeDatabase } from './lib/init-db';
import * as dotenv from 'dotenv';
import { getAdminWallet } from 'src/common/util';
dotenv.config();

async function bootstrap() {
  // Initialize database
  await initializeDatabase();
  getAdminWallet();
  const app = await NestFactory.create(AppModule);
  // Enable CORS for web3 wallet connections
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  await app.listen(process.env.PORT || 8080);
  console.log('Ozon API server is running on http://localhost:3000');
}
bootstrap();
