import { Injectable } from '@angular/core';
import { backendUrl } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly baseUrl = `${backendUrl}/messages`;
  private readonly routes = {
    getGroupWelcomeMessage: (groupName: string) => `${this.baseUrl}/welcome-message:${groupName}`,
    getGroupGoodbyeMessage: (groupName: string) => `${this.baseUrl}/goodbye-message:${groupName}`,
  }
  constructor(private http: HttpClient) { }

  getWelcomeMessage(groupName: string) {
    return this.http.get<Message>(this.routes.getGroupWelcomeMessage(groupName));
  }

  getGoodbyeMessage(groupName: string) {
    return this.http.get<Message>(this.routes.getGroupGoodbyeMessage(groupName));
  }

  getPaginated(pageSize: number, pageNumber: number, active = false) {
    return this.http.get<{ data: Message[], totalPages: number }>(this.baseUrl, { params: { pageSize, pageNumber, active } });
  }

  getMessageByCodeMessage(id: string) {
    return this.http.get<Message>(`${this.baseUrl}/${id}`);
  }

  create(message: Message) {
    return this.http.post<Message>(this.baseUrl, message);
  }

  update(id: number, message: Partial<Message>) {
    return this.http.put<Message>(`${this.baseUrl}/${id}`, message);
  }

  deactivate(id: number) {
    return this.http.delete<Message>(`${this.baseUrl}/${id}`);
  }

  reactivate(id: number) {
    return this.http.patch<Message>(`${this.baseUrl}/${id}`, {});
  }

  uploadMedia(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.patch<Message>(`${this.baseUrl}/add-media-to-message/${id}`, formData);
  }

  getMedia(name: string) {
    return this.http.get(`${this.baseUrl}/upload/${name}`, { responseType: 'blob' });
  }
}
