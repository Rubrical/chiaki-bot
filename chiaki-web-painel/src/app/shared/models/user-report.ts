export class UserReport {
  remoteJid?: string;
  nome?: string;
  dataCadastro?: Date;
  quantidadeGruposParticipa?: number;
  gruposParticipantes?: GrupoParticipantes[];
}

export class GrupoParticipantes {
  grupoRemoteJid?: string;
  nomeGrupo?: string;
  estadoGrupo?: boolean;
}
