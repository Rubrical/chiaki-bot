import { GroupParticipatingDto } from './group-participating.dto';

export class UserDto {
  remoteJid: string;
  nome: string;
  gruposParticipantes: Array<GroupParticipatingDto>;
  quantidadeGruposParticipa: number;
  dataCadastro: Date;
}
