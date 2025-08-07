import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailerService } from 'src/mailer/mailer.service';
import { generateOtp } from './otp.utils';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
     private mailerService: MailerService,
  ) {}

  async register(data: {
    name: string;
    email: string;
    password: string;
    dob?: Date;
    education?: string;
    certificate?: string;
  }) {
    const { email, password } = data;
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email already used');
    }

    const hash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');

   const otp = generateOtp();
const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

 const user = await this.userService.create({
    ...data,
    password: hash,
    emailVerificationOtp: otp,
    emailOtpExpiresAt: expires,
    verificationToken: ''
});
 const payload = { sub: user._id, email: user.email, role: user.role };
 const access_token = this.jwtService.sign(payload, { expiresIn: '1d' });

await this.mailerService.sendOtp(email, otp, 'verify');

    return { message: 'User registered. Verify your email.',user: user , access_token };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid user credentials');

    if (!user.isVerified) throw new UnauthorizedException('Email not verified');

    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: user,
    };

  }

  async verifyEmailOtp(email: string, otp: string) {
  const user = await this.userService.findByEmail(email);
  if (!user || user.isVerified) throw new UnauthorizedException();

  if (
    user.emailVerificationOtp !== otp ||
    !user.emailOtpExpiresAt ||
    new Date() > user.emailOtpExpiresAt
  ) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  user.isVerified = true;
  user.emailVerificationOtp = '';
  user.emailOtpExpiresAt = undefined;
  await user.save();

  return { 
    success: true,
    
    message: 'Email verified successfully' };
}

async sendResetOtp(email: string) {
  const user = await this.userService.findByEmail(email);
  if (!user) throw new NotFoundException('No user found');

  const otp = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordOtp = otp;
  user.resetOtpExpiresAt = expires;
  await user.save();

  await this.mailerService.sendOtp(email, otp, 'reset');
  return { message: 'OTP sent to email' };
}



  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return this.login(payload.email, ''); // get fresh tokens
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.userService.findByVerificationToken(token);
    if (!user) throw new UnauthorizedException('Invalid token');
    user.isVerified = true;
    user.verificationToken = '';
    await user.save();
    return { message: 'Email verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
  const user = await this.userService.findByEmail(email);
  if (
    !user ||
    user.resetPasswordOtp !== otp ||
    !user.resetOtpExpiresAt ||
    new Date() > user.resetOtpExpiresAt
  ) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordOtp = '';
  user.resetOtpExpiresAt = undefined;
  await user.save();

  return { message: 'Password reset successful' };
}

}
