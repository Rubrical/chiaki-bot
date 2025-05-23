import { PartialType } from '@nestjs/mapped-types';
import { RootDto } from './root.dto';

export class UpdateRootDto extends PartialType(RootDto) {}
