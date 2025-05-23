import { Injectable } from '@angular/core';
import { backendUrl } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Advertence, AdvertencePaginationFilter } from '../models/advertence';

@Injectable({
  providedIn: 'root'
})
export class AdvertenciaService {
  private readonly baseUrl = `${backendUrl}/advertence`;
  private readonly routes = {
    getListPaginate: () => `${this.baseUrl}/find-advertences-paginate`,
    getById: (id: number) => `${this.baseUrl}/find-advertence-by-id/${id}`,
    findAllUserAdvertences: () => `${this.baseUrl}/find-all-user-advertences`,
    findAllAdvertencesFromGroup: () => `${this.baseUrl}/find-all-advertences-from-group`,
  };

  constructor(
    private http: HttpClient,
  ) { }

  getListPaginate(pageSize: number, pageNumber: number, active: boolean) {
    return this.http.get<{ data: Advertence[], totalPages: number}>(this.routes.getListPaginate(), {
      params: { pageNumber, pageSize, active },
    })
  }

  getBydId(id: number) {
    return this.http.get<Advertence>(this.routes.getById(id));
  }

  getAllUserAdvertences(filter: AdvertencePaginationFilter) {
    return this.http.get<{ data: Advertence[], totalPages: number }>(this.routes.findAllUserAdvertences(), { params: { ...filter } });
  }

  getAllAdvertencesFromGroup(filter: AdvertencePaginationFilter) {
    return this.http.get<Advertence[]>(this.routes.findAllAdvertencesFromGroup(), { params: filter as any });
  }
}
