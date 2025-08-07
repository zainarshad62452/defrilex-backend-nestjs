import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService], // ✅ So it can be used in other modules
})
export class MailerModule {}
