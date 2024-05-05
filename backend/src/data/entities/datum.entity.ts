import { IsNumber, IsString } from 'class-validator';

export class Datum {
  @IsNumber()
  timestamp: number;

  @IsNumber()
  current: number;

  @IsString()
  deviceId: string;
}
