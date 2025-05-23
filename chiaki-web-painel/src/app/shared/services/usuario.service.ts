import { Injectable } from '@angular/core';
import { backendUrl } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { UserReport } from '../models/user-report';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly baseUrl = "users";
  private readonly routes = {
    getUser: (id: string) => `${backendUrl}/${this.baseUrl}/get-user/${id}`,
    getUserPaginate: () => `${backendUrl}/${this.baseUrl}/get-users-paginate`
  };

  constructor(private http: HttpClient) { }

  getUser(id: string) {
    return this.http.get<UserReport>(this.routes.getUser(id));
  }

  getUserPaginate(pageSize: number, pageNumber: number) {
    return this.http.get<{ data: Usuario[], total: number }>(this.routes.getUserPaginate(), {
      params: { pageNumber, pageSize },
    });
  }
}
