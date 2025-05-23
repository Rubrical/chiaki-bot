import { Injectable } from '@angular/core';
import { backendUrl } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Ban, BanList } from '../models/ban';

@Injectable({
  providedIn: 'root'
})
export class BanService {
  private readonly baseUrl = "ban";
  private readonly routes = {
    findBan: () => `${backendUrl}/${this.baseUrl}/find-ban`,
    findBannedUsersFromGroup: (id: string) => `${backendUrl}/${this.baseUrl}/find-banned-users-from-group/${id}`,
    removeBan: () => `${backendUrl}/${this.baseUrl}/remove-ban`,
    findBanPaginate: () => `${backendUrl}/${this.baseUrl}/find-ban-paginate`
  }
  constructor(private http: HttpClient) { }

  getBan(userRemoteJid: string, groupRemoteJid: string) {
    return this.http.get<Ban>(this.routes.findBan(), {
      params: { userRemoteJid, groupRemoteJid },
    });
  }

  getBannedFromGroup(id: string) {
    return this.http.get<BanList>(this.routes.findBannedUsersFromGroup(id));
  }

  removeBan(userRemoteJid: string, groupRemoteJid: string) {
    return this.http.patch<boolean>(this.routes.removeBan(), {
      userRemoteJid,
      groupRemoteJid
    });
  }

  getBansPaginate(pageNumber: number, pageSize: number) {
    return this.http.get<{ data: Ban[], total: number }>(this.routes.findBanPaginate(), { params: { pageNumber, pageSize }});
  }
}
