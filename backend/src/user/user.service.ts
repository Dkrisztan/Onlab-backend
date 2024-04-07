import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      +process.env.HASHROUND,
    );
    try {
      return await this.prisma.user.create({ data: createUserDto });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This email violates the unique constraint!',
        );
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        plugs: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        plugs: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
