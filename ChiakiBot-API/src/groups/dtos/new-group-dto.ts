import { GroupDataDto } from './group-data-dto';

export class NewGroupDto extends GroupDataDto {
  whatsappGroupId: string;
  nomeGrupo: string;
}
