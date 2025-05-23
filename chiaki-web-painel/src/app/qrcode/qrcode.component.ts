import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { environment } from '../../environments/environment';
import { ToastType } from '../shared/toast/toast.component';
import { VoltarComponent } from '../shared/voltar/voltar.component';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-qrcode',
  standalone: true,
  imports: [VoltarComponent],
  templateUrl: './qrcode.component.html',
  styleUrl: './qrcode.component.sass'
})
export class QrcodeComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private socket: Socket;
  isConnected: boolean = false;
  qrCode: string | null = null;
  qrImageUrl: string = '';

  constructor() {
    this.socket = io(environment.socketUrl);
  }

  ngOnInit(): void {
    this.socket.on("connect", () => {
      this.isConnected = true;

    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
      this.socket.disconnect();

      // this.openToast("Erro ao se comunicar com o servidor", "error");
      this.toastService.error("Erro ao se comunicar com o servidor", 8000);
    });

    this.socket.on('qr', (qrString: string) => {
      this.qrCode = qrString;
      this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

}
