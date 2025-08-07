import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsOptional()
  translatorId: string;

  @IsDateString()
  @IsNotEmpty()
  dateTime: string; // ISO format string

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number; // in hours

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsNumber()
  @IsNotEmpty()
  paidAmount: number;

  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @IsArray()
  @IsOptional()
  participants?: string[];

  @IsArray()
  @IsOptional()
  callLogs?: string[];

  @IsBoolean()
  @IsOptional()
  isInformedAdmin?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: string;
}
