import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegisterModule } from './auth/register/register.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './auth/login/login.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [RegisterModule, PrismaModule, LoginModule, QuizModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
