import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prismaService: PrismaService) {}

  create(createEventDto: CreateEventDto) {
    return this.prismaService.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date)
      } 
    })
  }

  findAll() {
    return this.prismaService.event.findMany()
  }

  findOne(id: number) {
    return `This action returns a #${id} event`
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    console.log(id)
    return this.prismaService.event.update({
      data: {
        ...updateEventDto, 
      },
      where: { id }
    })
  }

  remove(id: number) {
    return `This action removes a #${id} event`
  }

  removeAll(){
    const response = this. prismaService.event.deleteMany()
    console.log(response)
    return response
  }
}
