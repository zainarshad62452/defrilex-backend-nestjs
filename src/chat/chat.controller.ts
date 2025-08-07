import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CustomJwtAuthGuard } from '../auth/jwt.guard';

@Controller('chat')
@UseGuards(CustomJwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @UseGuards(CustomJwtAuthGuard)
   @Get('my-conversations')
   async getMyChats(@Req() req) {
     const userId = req.user.userId || req.user.sub;
     console.log('Fetching chat list for user:', userId);
     return this.chatService.getChatListForUser(userId);
   }

  @Get(':appointmentId')
  async getChat(@Param('appointmentId') id: string) {
    return this.chatService.getMessages(id);
  }

}
