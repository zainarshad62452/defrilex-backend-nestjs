import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  dob: Date;

  @Prop()
  education: string;

  @Prop()
  certificate: string;

  @Prop({ default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 0 })
  balance: number;

  @Prop()
  emailVerificationOtp?: string;

  @Prop()
  emailOtpExpiresAt?: Date;

  @Prop()
  resetPasswordOtp?: string;

  @Prop()
  resetOtpExpiresAt?: Date;

  @Prop({ default: null })
  verificationToken: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel = MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]);
