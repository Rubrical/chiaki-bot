export class Advertence {
  id?: number;
  advertenciaQuantidade?: number;
  dataUltimaAdvertencia?: Date;
  motivoAdvertencia?: string;
  nomeGrupo?: string;
  nomeUsuario?: string;
  usuarioRemoteJid?: string;
  idGrupoWhatsapp?: string;
}

export class AdvertencePaginationFilter {
  id?: string;
  activeAdvertences?: boolean;
  pageSize?: number;
  pageNumber?: number;
}
