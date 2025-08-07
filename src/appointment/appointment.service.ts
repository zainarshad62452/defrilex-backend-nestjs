import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CMSAppointment, AppointmentDocument } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(CMSAppointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  // ✅ Create a new appointment
  async create(createDto: CreateAppointmentDto, userId:string): Promise<CMSAppointment> {
    const created = new this.appointmentModel({
      userId,
      ...createDto,
      createdAt: new Date(),
    });
    
    return created.save();
  }

  // ✅ Get all appointments (admin or by filter later)
  async findAll(): Promise<CMSAppointment[]> {
    return this.appointmentModel.find().exec();
  }

  // ✅ Get one appointment by ID
  async findOne(id: string): Promise<CMSAppointment> {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) throw new NotFoundException(`Appointment ${id} not found`);
    return appointment;
  }

  // ✅ Update appointment — restrict certain fields based on user role
  async update(
    id: string,
    updateDto: UpdateAppointmentDto,
    userRole: string,
  ): Promise<CMSAppointment> {
    // Only admin can update `status`
    // if (userRole === 'admin') {
    //   delete updateDto.status;
    //   delete updateDto.paidAmount; // Optional: protect this too
    // }

    const updated = await this.appointmentModel.findByIdAndUpdate(id, updateDto, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new NotFoundException(`Appointment ${id} not found`);
    return updated;
  }

  async acceptAppointment(id: string, translatorId: string): Promise<CMSAppointment> {
    const updated = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: 'approved',translatorId:  translatorId},
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundException(`Appointment ${id} not found`);
    return updated;
  }
  // ✅ Delete an appointment
  async remove(id: string): Promise<void> {
    const result = await this.appointmentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Appointment ${id} not found`);
  }

  // ✅ (Optional) Get appointments by user
  async findByUser(userId: string): Promise<CMSAppointment[]> {
    return this.appointmentModel.find({ userId }).exec();
  }
  async findByUserApporvedAppointments(userId: string): Promise<CMSAppointment[]> {
    return this.appointmentModel.find({ userId,status: "approved" }).exec();
  }

  // ✅ (Optional) Get appointments by translator
  async findByTranslator(translatorId: string): Promise<CMSAppointment[]> {
    return this.appointmentModel.find({ translatorId }).exec();
  }

  async findWithFilters(
  filters: { status?: string; userId?: string; translatorId?: string },
  page = 1,
  limit = 10,
): Promise<{ data: CMSAppointment[]; total: number; page: number }> {
  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.userId) query.userId = filters.userId;
  if (filters.translatorId) query.translatorId = filters.translatorId;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.appointmentModel.find(query).skip(skip).limit(limit).exec(),
    this.appointmentModel.countDocuments(query).exec(),
  ]);

  return {
    data,
    total,
    page,
  };
}

}
