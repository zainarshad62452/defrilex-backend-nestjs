import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppointmentDocument = CMSAppointment & Document;

@Schema({ timestamps: true })
export class CMSAppointment {
  @Prop({ required: true })
  userId: string;

  @Prop({default: null})
  translatorId: string;

  @Prop({ required: true })
  dateTime: Date; // stored in UTC

  @Prop({ required: true })
  purpose: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected','completed'] })
  status: string;

  @Prop({ required: true })
  paidAmount: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ default: false })
  isInformedAdmin: boolean;

  @Prop({ type: [String], default: [] })
  participants: string[];

  @Prop({ required: true })
  duration: number; // in hours

  @Prop({ required: true })
  language: string;

  @Prop({ type: [String], default: [] })
  callLogs: string[];
}

export const CMSAppointmentSchema = SchemaFactory.createForClass(CMSAppointment);
