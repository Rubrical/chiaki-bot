export class PaginationResponse<T> {
  totalPages: number;
  data: T[] | T;
}
