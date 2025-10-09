import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { botServerUrl } from '../../app.config';
import { BotStatusData } from '../models/bot-status';

@Injectable({
  providedIn: 'root'
})
export class BotServerService {

  constructor(private http: HttpClient) { }

  disconnectBot() {
    return this.http.post<{ message: string, success: boolean}>(`${botServerUrl}/disconnect-bot`, null);
  }

  botStatus() {
    return this.http.get<BotStatusData>(`${botServerUrl}/status`);
  }

  sendMessage(to: string, message: string) {
    return this.http.post<{ message: string, success: boolean }>(
      `${botServerUrl}/send-private-message`, { to, message }
    );
  }
}
