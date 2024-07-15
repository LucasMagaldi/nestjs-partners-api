import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReserveSpotDto } from './dto/reserve-spot.dto';
import { Prisma, SpotStatus, TicketStatus } from '@prisma/client';

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

  async reserveSpot(dto: ReserveSpotDto & { eventId: string}) {
    const spots = await this.prismaService.spot.findMany({
      where: {
        eventId: dto.eventId,
        name: {
          in: dto.spots
        }
      }
    })

    if(spots.length !== dto.spots.length) {
      const foundedSpotsName = spots.map((spot) => spot.name)
      const notFoundedSpots = dto.spots.filter((spotName) => !foundedSpotsName.includes(spotName))

      throw new Error(`Spots ${notFoundedSpots.join(', ')} not founded`)
    }

    try {
      const tickets = await this.prismaService.$transaction(async (prisma) => {
        await prisma.reservetionHistory.createMany({
          data: spots.map((spot) => ({
            spotId: spot.id,
            ticketKind: dto.ticket_kind,
            email: dto.email,
            status: TicketStatus.reserved
          })),
        })
    
        await prisma.spot.updateMany({
          where: {
            id: {
              in: spots.map((spot) => spot.id),
            },
          },
          data: {
            status: SpotStatus.reserved
          },
        })
    
        const tickets = await Promise.all(
          spots.map((spot) => prisma.ticket.create({
            data: {
              email: dto.email,
              ticketKind: dto.ticket_kind,
              spotId: spot.id,
              status: TicketStatus.reserved,
            },
          }))
        )
        return tickets
        },{
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
        )
      return tickets
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2002': // unique constraint violation
          case'P2034': // transaction conflict
            throw new Error('Some spots are already reserved.')
        }
      }
      throw e
    }
  }
}
