import { PaginationFilter } from '../../shared/dtos/pagination-filter';

export class AdvertencePaginationFilter extends PaginationFilter {
  id: string;
  activeAdvertences: boolean;
}
