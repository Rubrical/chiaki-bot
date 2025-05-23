import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { backendUrl } from '../../app.config';

export interface Root {
  username?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string|null = localStorage.getItem('token');
  private thereIsRoot: boolean = false;
  private readonly baseUrl = "root";
  private readonly routes = {
    check: `${backendUrl}/${this.baseUrl}/check-if-exists`,
    new: `${backendUrl}/${this.baseUrl}/new`,
    update: `${backendUrl}/${this.baseUrl}/update`,
    login: `${backendUrl}/${this.baseUrl}/login`
  }
  constructor(private http: HttpClient) { }

  private decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = atob(token.split('.')[1]);
      return JSON.parse(payload);
    } catch (e) {
      return null;
    }
  }

  isTokenValid(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }

  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.username ?? null;
  }

  getRootId(): number | null {
    const decoded = this.decodeToken();
    return decoded?.sub ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  removeToken(): void {
    localStorage.removeItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.token = token;
  }

  login(root: Root): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.routes.login, root);
  }

  signup(root: Root): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.routes.new, root);
  }

  checkRootExists(): Observable<boolean> {
    return this.http.get<boolean>(this.routes.check);
  }
}
