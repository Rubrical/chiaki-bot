export class Grupo {
  id?: number;
  dataCadastro?: string;
  dataInativo?: string | null;
  whatsappGroupId?: string;
  nomeGrupo?: string;
  donoGrupoId?: string;
  descricaoGrupo?: string;
  msgEntradaAtiva?: boolean;
  msgSaidaAtiva?: boolean;
  mensagemEntradaId?: number | null;
  mensagemSaidaId?: number | null;
}
