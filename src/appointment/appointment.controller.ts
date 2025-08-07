import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CustomJwtAuthGuard } from 'src/auth/jwt.guard';
import { ValidationError } from 'class-validator';
import { UserService } from 'src/user/user.service';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService,private readonly userServices:UserService) {}

  @UseGuards(CustomJwtAuthGuard)
  @Post()
  async create(@Req() req,@Body() createAppointmentDto: CreateAppointmentDto) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException('User ID is required to create an appointment');
    }
    if( req.user.role !== 'user') {
      throw new ForbiddenException('Only user can create appointments');
    }

    const user = await this.userServices.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userBalance = user.balance || 0;
    if (userBalance <= 0 || userBalance < createAppointmentDto.paidAmount) {
      throw new ForbiddenException('User balance is insufficient to create an appointment');
    }

    const appointment = await this.appointmentService.create(createAppointmentDto,userId);
    if (!appointment) {
      throw new NotFoundException('Failed to create appointment');
    }
    user.balance -= createAppointmentDto.paidAmount;
    await this.userServices.update(userId, { balance: user.balance });
    return {
      success: true,
      message: 'Appointment created successfully',
       appointment,
    }  
  }

   @UseGuards(CustomJwtAuthGuard)
     @Get()
  async findAll(@Req() req,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('translatorId') translatorId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const appointments = await this.appointmentService.findWithFilters(
      { status, userId, translatorId },
      +page,
      +limit,
    );

    return {
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
    };
  }

   @UseGuards(CustomJwtAuthGuard)
  @Patch('accept-appointment/:id')
  async acceptAppointment(@Req() req,@Param('id') id: string,) {
    try{
   
    if (req.user.role !== 'interpreter') {
      throw new ForbiddenException('Only interpreter cannot update appointment status');
    }
    const result = await  this.appointmentService.acceptAppointment(id, req.user.userId);
     return {
      success: true,
      message: `Appointment accepted successfully`,
      data: result,
    };
  } catch (error) {
    throw new NotFoundException(`Failed to accept appointment ${id}: ${error.message}`);
  }
  }
   @UseGuards(CustomJwtAuthGuard)
  @Get('getUserAppointments')
  async getUserAppointments(@Req() req) {
    try{
      const userId = req.user.userId;
      if (!userId) {
        throw new ForbiddenException('User ID is required to get appointments');
      }
      if( req.user.role === 'user') {
      const appointments = await this.appointmentService.findByUser(userId);
      return {
        success: true,
        message: 'User appointments retrieved successfully',
        data: appointments,
      };
    } else if( req.user.role === 'interpreter') {
    const result = await  this.appointmentService.findByTranslator( req.user.userId);
     return {
      success: true,
      message: `User appointments retrieved successfully`,
      data: result,
    };
  } else{
      throw new ForbiddenException('Only user or interpreter can get appointments');
    
  }
  } catch (error) {
    throw new NotFoundException(`Failed to get appointment: ${error.message}`);
  }
  }
   @UseGuards(CustomJwtAuthGuard)
  @Get('getUserAppointments/approved')
  async getUserApprovedAppointments(@Req() req) {
    try{
      const userId = req.user.userId;
      if (!userId) {
        throw new ForbiddenException('User ID is required to get appointments');
      }
      if( req.user.role === 'user') {
      const appointments = await this.appointmentService.findByUserApporvedAppointments(userId);
      return {
        success: true,
        message: 'User appointments retrieved successfully',
        data: appointments,
      };
    }  else{
      throw new ForbiddenException('Only user can get appointments');
    
  }
  } catch (error) {
    throw new NotFoundException(`Failed to get appointment: ${error.message}`);
  }
  }

   @UseGuards(CustomJwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req,@Param('id') id: string) {
    const appointment = await this.appointmentService.findOne(id);
    
    if (!appointment) throw new NotFoundException(`Appointment ${id} not found`);
    return {
      success: true,
      message: `Appointment ${id} found successfully`,
      data: appointment,
    };
  }

   @UseGuards(CustomJwtAuthGuard)
  @Patch(':id')
  async update(@Req() req,@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    try{
   
    if (req.user.role === 'admin' && updateAppointmentDto.status) {
      throw new ForbiddenException('Only admin cannot update appointment status');
    }
    const result = await  this.appointmentService.update(id, updateAppointmentDto, req.user.role);
     return {
      success: true,
      message: `Appointment ${id} updated successfully`,
      data: result,
    };
  } catch (error) {
    throw new NotFoundException(`Failed to update appointment ${id}: ${error.message}`);
  }
  }
  

 @UseGuards(CustomJwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req,@Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete appointments');
    }
    try {
    await this.appointmentService.remove(id);
    return {
      success: true,
      message: `Appointment ${id} deleted successfully`,
    };
  } catch (error) {
    throw new NotFoundException(`Appointment ${id} not found`);   
  }
}
}
