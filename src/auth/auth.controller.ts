import { Body, Controller, Get, Post, Query, Req, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CustomJwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
      ) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }
  
  @Get('verify')
  verify(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

@UseGuards(CustomJwtAuthGuard)
@Post('verify-otp')
verifyOtp(@Req() req, @Body() body: { otp: string }) {
  const email = req.user?.email;
  return this.authService.verifyEmailOtp(email, body.otp);
}

@Post('request-reset')
requestReset(@Body() body: { email: string }) {
  return this.authService.sendResetOtp(body.email);
}

@UseGuards(CustomJwtAuthGuard)
@Post('reset-password')
resetPassword(@Req() req,@Body() body: { email: string; otp: string; password: string }) {
  return this.authService.resetPassword(body.email, body.otp, body.password);
}
}
