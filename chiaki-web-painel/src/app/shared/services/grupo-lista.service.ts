import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backendUrl } from '../../app.config';
import { GroupsList } from '../models/groups-list';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrupoListaService {
  private readonly baseUrl = "groups";
  private readonly routes = {
    lista: `${backendUrl}/${this.baseUrl}/groups-paginate`,
    contagem: `${backendUrl}/${this.baseUrl}/all-groups-count`
  };

  constructor(private http: HttpClient) { }

  getLista(pageSize: number, pageNumber: number): Observable<{ data: GroupsList[], total: number}> {
    return this.http.get<{ data: GroupsList[], total: number}>(this.routes.lista, {
      params: { pageSize, pageNumber }
    });
  }

  getCount(): Observable<number> {
    return this.http.get<number>(this.routes.contagem);
  }
}
