import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Message } from '../../shared/models/message';
import { MessagesService } from '../../shared/services/messages.service';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule, Location } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-mensagem-consulta',
  standalone: true,
  imports: [CommonModule, VoltarComponent, RouterLink],
  templateUrl: './mensagem-consulta.component.html',
  styleUrl: './mensagem-consulta.component.sass'
})
export class MensagemConsultaComponent implements OnInit {
  message!: Message;
  imageUrl: string | null = null;
  showImage = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private messagesService: MessagesService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const chaveMensagem = this.route.snapshot.paramMap.get('id');
    if (chaveMensagem) {
      this.messagesService.getMessageByCodeMessage(chaveMensagem).subscribe({
        next: res => {
          this.message = res;
          if (this.message.midia) {
            this.loadImage(this.message.midia);
          }
        },
        error: err => {
          console.error(err);
          this.toastService.error("Erro ao carregar mensagem");
        }
      });
    }
  }

  loadImage(fileName: string): void {
    this.messagesService.getMedia(fileName).subscribe({
      next: (blob) => {
        this.imageUrl = URL.createObjectURL(blob);
      },
      error: (err) => {
        console.error('Erro ao carregar a imagem:', err);
      }
    });
  }

  toggleImage(fileName: string): void {
    if (this.showImage) {
      this.showImage = false;
      this.imageUrl = null;
    } else {
      this.messagesService.getMedia(fileName).subscribe({
        next: (blob) => {
          this.imageUrl = URL.createObjectURL(blob);
          this.showImage = true;
        },
        error: (err) => {
          console.error('Erro ao carregar a imagem:', err);
        }
      });
    }
  }

  changeStatus() {
    if (!this.message) return;
    if (this.message.dataInativo) {
      this.messagesService.reactivate(this.message.id!).subscribe({
        next: res => {
          console.log(res);
          this.toastService.success('Mensagem reativada com sucesso!', 1500);
          this.location.back();
          console.log(this.location.getState());
        },
        error: err => {
          console.error(err);
          if (err.error.message) {
            this.toastService.warning(err.error.message);
            return;
          }
          this.toastService.error('Um erro ocorreu ao desativar a mensagem', 1500);
        },
      });
    } else {
      this.messagesService.deactivate(this.message.id!).subscribe({
        next: res => {
          console.log(res);
          this.toastService.success('Mensagem desativada com sucesso!', 1500);
          this.location.back();
        },
        error: err => {
          console.error(err);
          if (err.error.message) {
            this.toastService.warning(err.error.message);
            return;
          }
          this.toastService.error('Um erro ocorreu ao desativar a mensagem', 1500);
        },
      });
    }
  }

}
