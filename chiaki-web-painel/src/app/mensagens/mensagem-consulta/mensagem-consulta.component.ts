import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Message } from '../../shared/models/message';
import { MessagesService } from '../../shared/services/messages.service';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule, Location, NgOptimizedImage } from '@angular/common';
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
  chaveMensagem?: string;
  mediaType: 'image' | 'video' | null = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private messagesService: MessagesService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const chaveMensagem = this.route.snapshot.paramMap.get('id');
    console.log("Ng on init", chaveMensagem);
    if (chaveMensagem) {
      this.chaveMensagem = chaveMensagem;
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

  private loadImage(fileName: string): void {
    this.messagesService.getMedia(fileName).subscribe({
      next: (blob) => {
        this.imageUrl = URL.createObjectURL(blob);

        if (blob.type.startsWith('video')) {
          this.mediaType = 'video';
        } else if (blob.type.startsWith('image')) {
          this.mediaType = 'image';
        } else {
          this.mediaType = null;
          this.imageUrl = null;
          this.toastService.warning('Tipo de mídia não suportado.');
        }
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
      this.mediaType = null;
    } else {
      this.loadImage(fileName);
      this.showImage = true;
    }
  }

  changeStatus() {
    if (!this.message) return;
    if (this.message.dataInativo) {
      this.messagesService.reactivate(this.message.id!).subscribe({
        next: res => {
          if (!res) {
            this.toastService.warning('Houve um erro ao reativar a mensagem. Tente novamente mais tarde.', 1500);
            return;
          }

          this.toastService.success('Mensagem reativada com sucesso!', 1500);
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
    } else {
      this.messagesService.deactivate(this.message.id!).subscribe({
        next: res => {
          if (!res) {
            this.toastService.warning('Houve um erro ao desativar a mensagem. Tente novamente mais tarde.', 1500);
            return;
          }

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
