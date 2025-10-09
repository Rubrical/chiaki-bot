import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { environment } from '../../environments/environment';
import { ToastType } from '../shared/toast/toast.component';
import { VoltarComponent } from '../shared/voltar/voltar.component';
import { ToastService } from '../shared/services/toast.service';
import { BotServerService } from '../shared/services/bot-server.service';
import { BotStatusData } from '../shared/models/bot-status';

@Component({
  selector: 'app-qrcode',
  standalone: true,
  imports: [VoltarComponent],
  templateUrl: './qrcode.component.html',
  styleUrl: './qrcode.component.sass'
})
export class QrcodeComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private botServerService = inject(BotServerService)
  private socket: Socket;
  isConnected: boolean = false;
  qrCode: string | null = null;
  qrImageUrl: string = '';
  botData: BotStatusData | null = null;

  constructor() {
    this.socket = io(environment.socketUrl);
  }

  private callBotStatus() {
    this.botServerService.botStatus().subscribe({ next: data => {
        console.log(data);
        this.botData = data;
      },
      error: err => {
        this.toastService.warning("Não foi possivel resgatar as informações do bot");
        console.error(err);
      }
    });
  }

  ngOnInit(): void {
    this.callBotStatus();
    this.socket.on("connect", () => {
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
      this.socket.disconnect();

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

  disconnectBot(): void {
    this.botServerService.disconnectBot().subscribe({ next: data => {
        if (data.success === true) {
          this.toastService.success(data.message);
        }
        else {
          this.toastService.error("Um erro ocorreu");
        }
      },
      error: (error: any) => {
        this.toastService.error("Um erro ocorreu e não foi possível desconectar o bot");
        console.error(error);
      }
    });
  }
}
