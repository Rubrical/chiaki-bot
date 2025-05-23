import { PaginationFilter } from '../../shared/dtos/pagination-filter';

export class FindAdvertenceDto extends PaginationFilter {
  userRemoteJid: string;
  whatsappGroupId: string;
  activeAdvertences: boolean;
}
