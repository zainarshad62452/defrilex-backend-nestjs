import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
    //   user: process.env.EMAIL_USER,
    //   pass: process.env.EMAIL_PASS,
    user: 'flammywalabhai@gmail.com',
        pass: 'atkk eswx yotm yapq'
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `http://localhost:3000/auth/verify?token=${token}`;

    const info = await this.transporter.sendMail({
      from: '"Nest Auth" <flammywalabhai@gmail.com>',
      to,
      subject: 'Verify your account',
      html: `
        <h3>Welcome!</h3>
        <p>Please verify your account:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
      `,
    });

    console.log('Email sent: %s', info.messageId);
  }

  async sendOtp(to: string, otp: string, purpose: 'verify' | 'reset') {
  const subject = purpose === 'verify' ? 'Verify Your Email' : 'Reset Your Password';
  const message = `
    <p>Your OTP code is:</p>
    <h2>${otp}</h2>
    <p>This code will expire in 10 minutes.</p>
  `;

  return this.transporter.sendMail({
    from: '"Nest Auth" <your.email@gmail.com>',
    to,
    subject,
    html: message,
  });
}

}
