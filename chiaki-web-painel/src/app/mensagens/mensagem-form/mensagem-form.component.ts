import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { MessagesService } from '../../shared/services/messages.service';
import { CommonModule, Location } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-mensagem-form',
  standalone: true,
  imports: [CommonModule, VoltarComponent, ReactiveFormsModule],
  templateUrl: './mensagem-form.component.html',
  styleUrl: './mensagem-form.component.sass'
})
export class MensagemFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  codeMessage?: string;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private mensagemService: MessagesService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      chaveMensagem: ['', Validators.required],
      mensagem: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.isEdit = true;
      this.codeMessage = param;

      this.mensagemService.getMessageByCodeMessage(this.codeMessage).subscribe({
        next: data => {
          this.form.patchValue(data);
          this.id = data.id;
        },
        error: err => {
          console.error(err);
          this.toastService.error('Erro ao carregar a mensagem');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.isEdit) {
      this.mensagemService.update(this.id!, this.form.value).subscribe({
        next: () => {
          this.toastService.success('Mensagem atualizada');
          this.location.back();
        },
        error: err => {
          console.error(err);
          this.toastService.error('Erro ao atualizar');
        }
      });
    } else {
      this.mensagemService.create(this.form.value).subscribe({
        next: () => {
          this.toastService.success('Mensagem criada');
          this.location.back();
        },
        error: err => {
          console.error(err);
          this.toastService.error('Erro ao criar');
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedFile = null;
      this.toastService.warning('Selecione uma imagem');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('❌ Formato inválido. Apenas .jpg, .png, .jpeg e .mp4 são permitidos.');
      input.value = '';
      this.selectedFile = null;
      return;
    }

    if (file.size > 2_500_000) {
      this.toastService.error('⚠️ Arquivo muito grande! O limite é 2.5MB.');
      input.value = '';
      this.selectedFile = null;
      return;
    }

    if (file.type === 'image/gif') {
      this.toastService.error('❌ GIFs não são suportados. Por favor, envie um vídeo .mp4.');
      input.value = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.mensagemService.uploadMedia(this.id!, this.selectedFile).subscribe({
      next: (message) => {
        console.log(message); // nada está a ser logado, logo não está a ser enviado

        this.toastService.success('Mídia adicionada');
        this.router.navigateByUrl('/mensagens/mensagem-lista')
          .catch(err => {
            console.error(err);
            this.toastService.error('Erro ao redirecionar. Tente novamente mais tarde.')
          });
      },
      error: err => {
        console.error(err);
        this.toastService.error('Erro ao adicionar mídia');
      }
    });
  }
}
