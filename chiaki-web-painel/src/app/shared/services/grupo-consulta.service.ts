import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backendUrl } from '../../app.config';
import { GroupReport } from '../models/group-report';
import { Observable } from 'rxjs';
import { GroupRank } from '../models/group-rank';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class GrupoConsultaService {
  private readonly baseUrl = 'groups'
  private readonly routes = {
    getReport: (id: string) => `${backendUrl}/${this.baseUrl}/get-report/${id}`,
    getGroupMembers: (id: string) => `${backendUrl}/${this.baseUrl}/get-group-members-by-filter/${id}`,
    getRank: (id: string) => `${backendUrl}/${this.baseUrl}/get-most-active-members-from-group/${id}`,
    getUsersFromGroup: (id: string) => `${backendUrl}/${this.baseUrl}/get-group-members-by-filter/${id}`
  }

  constructor(private http: HttpClient) { }

  groupReport(id: string): Observable<GroupReport> {
    return this.http.get<GroupReport>(this.routes.getReport(id));
  }

  getRank(id: string, qty: number = 5) {
    return this.http.get<GroupRank[]>(this.routes.getRank(id), { params: { qty: qty } });
  }

  getUsersFromGroup(groupId: string, pageSize = 10, pageNumber = 1) {
    return this.http.get<{ data: Usuario[], total: number}>(this.routes.getUsersFromGroup(groupId), {
       params: { pageSize, pageNumber }
      });
  }
}
