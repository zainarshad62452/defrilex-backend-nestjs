export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  dob?: Date;
  education?: string;
  certificate?: string;
  emailVerificationOtp?: string;
  emailOtpExpiresAt?: Date;
}