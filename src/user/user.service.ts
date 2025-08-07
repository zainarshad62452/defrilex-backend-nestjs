import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<CreateUserDto> & { password: string; verificationToken: string }) {
    
    const user = new this.userModel(data);
    return user.save();
  }

  async findByEmail(email: string) {
    if (!email) {
      throw new NotFoundException('Email is required to find user');
    }
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }

  async findByVerificationToken(token: string) {
    
    return this.userModel.findOne({ verificationToken: token }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
     const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async remove(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    user.deletedAt = new Date();
     return this.userModel.findByIdAndDelete(id).exec();
  }

 async update(id: string, updateData: Partial<User>) {
   const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
  return this.userModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}
 async addBalance(id: string, updateBalance: number) {
   const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
  const newUser = await this.userModel.findByIdAndUpdate(id, {
    balance: user.balance + updateBalance,
  }, {
    new: true,
    runValidators: true,
  });
  return {
    success: true,
    message: 'Balance updated successfully',
    data: newUser,
  };
}
}
