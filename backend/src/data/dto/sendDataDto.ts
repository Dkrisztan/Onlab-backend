import { IsNumber, IsString } from 'class-validator';

export class SendDataDto {
  @IsNumber()
  timestamp: number;

  @IsNumber()
  current: number;

  @IsString()
  deviceId: string;
}
