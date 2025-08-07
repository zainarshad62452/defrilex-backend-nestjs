import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import {MongooseModule} from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailerService } from './mailer/mailer.service';
import { MailerModule } from './mailer/mailer.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/defrilex'),
    UserModule,
    AuthModule,
    MailerModule,
    AppointmentModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailerService],
  exports: [MailerService], // Export MailerService for use in other modules
})
export class AppModule {}
