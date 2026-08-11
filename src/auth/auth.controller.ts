import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorators/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  // Login cần thêm @Public để nó không bị check jwt,
  // Nếu có public thì sẽ keep qua @UseGuards(JwtAuthGuard) không check
  // thường thì 1 số cái sẽ public không cần check như: login, register
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  hanldeLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Get('mail')
  @Public()
  testMail() {
    this.mailerService.sendMail({
      to: 'meowmeowmeowgiameo@gmail.com', // list of receivers
      // from: 'noreply@nestjs.com',
      subject: 'Testing Nest MailerModule', // subject line
      text: 'welcome', // plaintexxt body
      template: 'register',
      context: {
        name: 'Tien',
        activationCode: 123456789,
      },
    });
    return 'send mail ok';
  }
}
