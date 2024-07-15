import { Injectable } from '@nestjs/common';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { SpotStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpotsService {

  constructor(private prismaService: PrismaService) {}

  async create(createSpotDto: CreateSpotDto & { eventId: string }) {
    console.log(createSpotDto.eventId, createSpotDto)
    const event = await this.prismaService.event.findFirst({
      where: { id: createSpotDto.eventId }
    })
    if (!event) throw new Error('Event Not Found')

    return this.prismaService.spot.create({
      data: {status: 'available', ...createSpotDto}
    })
  }

  findAll(eventId: string) {
    return this.prismaService.spot.findMany({ where: { eventId }})
  }

  findOne(eventId: string, spotId: string) {
    return this.prismaService.spot.findUnique({
      where: {
        eventId,
        id: spotId
      }
    })
  }

  update(eventId: string, spotId: string, updateSpotDto: UpdateSpotDto) {
    return this.prismaService.spot.update({
      where: {
        eventId,
        id: spotId
      },
      data: updateSpotDto
    })
  }

  remove(eventId: string, spotId: string) {
    return this.prismaService.spot.delete({ 
      where: {
        eventId,
        id: spotId
    }})
  }
}
