import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomJwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // You may want to generate or get password and verificationToken here
    const password = createUserDto.password || ''; // Replace with actual logic
    const verificationToken = ''; // Replace with actual logic to generate token
    return this.userService.create({
      ...createUserDto,
      password,
      verificationToken,
    });
  }
  @UseGuards(CustomJwtAuthGuard)
  @Get('get-all') 
  findAll(@Req() req) {
    return this.userService.findAll();
  }
  @UseGuards(CustomJwtAuthGuard)
  @Patch('addBalance')
  addBalance(@Req() req, @Body() updateUserDto: { balance: number }) {
    if (!updateUserDto.balance || updateUserDto.balance <= 0) {
      throw new Error('Invalid balance amount');
    }
    
    return this.userService.addBalance(req.user.userId, updateUserDto.balance);
  }
  @UseGuards(CustomJwtAuthGuard)
  @Get(':id')
  findOne(@Req() req,@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  @UseGuards(CustomJwtAuthGuard)
  @Get()
  findCurrentUser(@Req() req) {
    return this.userService.findByEmail(req.user.email);
  }

  @UseGuards(CustomJwtAuthGuard)
  @Patch(':id')
  update(@Req() req,@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
  

  @UseGuards(CustomJwtAuthGuard)
  @Delete(':id')
  remove(@Req() req,@Param('id') id: string) {
    return this.userService.remove(id);
  }

  
}
