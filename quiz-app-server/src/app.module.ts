import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegisterModule } from './auth/register/register.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './auth/login/login.module';

@Module({
  imports: [RegisterModule, PrismaModule, LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
