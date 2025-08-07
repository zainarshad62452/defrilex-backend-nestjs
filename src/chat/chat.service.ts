import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/chat-message.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async saveMessage(data: {
    appointmentId: string;
    senderId: string;
    receiverId: string;
    content: string;
  }): Promise<Chat> {
    const message = new this.chatModel(data);
    return message.save();
  }

  async getMessages(appointmentId: string): Promise<Chat[]> {
    return this.chatModel
      .find({ appointmentId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async markAsSeen(appointmentId: string, receiverId: string): Promise<void> {
    await this.chatModel.updateMany(
      { appointmentId, receiverId, isSeen: false },
      { $set: { isSeen: true } },
    );
  }

  // chat.service.ts
async getChatListForUser(userId: string) {
  const userIdStr = userId.toString();

  const chats = await this.chatModel.aggregate([
    {
      $match: {
        $or: [
          { senderId: userIdStr },
          { receiverId: userIdStr }
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          appointmentId: "$appointmentId",
          otherUser: {
            $cond: [
              { $eq: ["$senderId", userIdStr] },
              "$receiverId",
              "$senderId"
            ]
          }
        },
        lastMessage: { $first: "$$ROOT" }
      }
    },
    {
      $project: {
        _id: 0,
        appointmentId: "$_id.appointmentId",
        otherUserId: "$_id.otherUser",
        lastMessage: "$lastMessage.content",
        timestamp: "$lastMessage.createdAt",
        seen: "$lastMessage.seen"
      }
    },
    { $sort: { timestamp: -1 } }
  ]);

  // ✅ Await all user details
  const allChats = await Promise.all(chats.map(async (chat) => {
    if(chat.otherUserId.length !== 24) {
      return {
        appointmentId: chat.appointmentId,
        lastMessage: chat.lastMessage,
        timestamp: chat.timestamp,
        seen: chat.seen,
        otherUser: null, // Invalid user ID
      };
    }
    const otherUser = await this.userModel.findById(chat.otherUserId).lean();
    return {
      appointmentId: chat.appointmentId,
      lastMessage: chat.lastMessage,
      timestamp: chat.timestamp,
      seen: chat.seen,
      otherUser: otherUser ? {
        _id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
      } : null
    };
  }));

  return {
    success: true,
    message: 'Chat list fetched successfully',
    chats: allChats,
    total: allChats.length
  };
}



}
