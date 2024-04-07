import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PlugService } from './plug.service';
import { Prisma } from '@prisma/client';

@Controller('plug')
export class PlugController {
  constructor(private readonly plugService: PlugService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plugService.findOne(id);
  }

  @Get()
  findAll() {
    return this.plugService.findAll();
  }

  @Post()
  create(@Body() createPlugDto: Prisma.PlugCreateInput) {
    return this.plugService.create(createPlugDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlugDto: Prisma.PlugUpdateInput,
  ) {
    return this.plugService.update(id, updatePlugDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plugService.remove(id);
  }
}
