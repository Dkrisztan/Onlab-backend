import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DataService } from './data.service';
import { SendDataDto } from './dto/sendDataDto';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post()
  create(@Body() sendDataDto: SendDataDto) {
    return this.dataService.create(sendDataDto);
  }

  @Get(':id')
  getData(@Param('id') id: string) {
    return this.dataService.getData(id);
  }
}
