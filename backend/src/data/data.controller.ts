import { Body, Controller, Post } from '@nestjs/common';
import { DataService } from './data.service';
import { SendDataDto } from './dto/sendDataDto';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post()
  create(@Body() sendDataDto: SendDataDto) {
    return this.dataService.create(sendDataDto);
  }
}
