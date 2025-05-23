import { Grupo } from "./grupo";

export class Ban {
  id?: number;
  userRemoteJid?: string;
  motivoBan?: string;
  dataCadastro?: Date;
  dataInativo?: Date;
  grupo?: Grupo;
}

export class BanList {
  bannedUsersFromGroup?: Ban[];
  bannedQuantity?: number;
}
