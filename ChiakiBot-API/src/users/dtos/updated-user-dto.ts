import { UserTypeEnum } from '../../shared/enums/user-type-enum';

export class UpdatedUserDto {
  remoteJid: string;
  name: string;
  newRole?: UserTypeEnum;
}
