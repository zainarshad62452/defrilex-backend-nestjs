import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CMSAppointment, CMSAppointmentSchema } from './entities/appointment.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
     MongooseModule.forFeature([
      { name: CMSAppointment.name, schema: CMSAppointmentSchema },
    ]),
     MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },  
    ]),
    UserModule, // Assuming UserModule is defined and exports UserService
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
