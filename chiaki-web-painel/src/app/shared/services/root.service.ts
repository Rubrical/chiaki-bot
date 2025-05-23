import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Root } from './auth.service';
import { backendUrl } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class RootService {
  private readonly baseUrl = `${backendUrl}/root/update`
  constructor(
    private http: HttpClient,
  ) { }

  updateRoot(id: number, root: Root) {
    return this.http.put<Partial<Root>>(`${this.baseUrl}/${id}`,
      {
        username: root.username,
        password: root.password
      }
    );
  }
}
