import { PartialType } from '@nestjs/mapped-types';
import { CreatePlugDto } from './create-plug.dto';

export class UpdatePlugDto extends PartialType(CreatePlugDto) {}
