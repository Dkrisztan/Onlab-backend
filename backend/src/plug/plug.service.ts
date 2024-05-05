import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PlugService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.plug.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.plug.findMany();
  }

  async create(createPlugDto: Prisma.PlugCreateInput) {
    return this.prisma.plug.create({ data: createPlugDto });
  }

  async update(id: string, updatePlugDto: Prisma.PlugUpdateInput) {
    return this.prisma.plug.update({ where: { id }, data: updatePlugDto });
  }

  async remove(id: string) {
    return this.prisma.plug.delete({ where: { id } });
  }
}
