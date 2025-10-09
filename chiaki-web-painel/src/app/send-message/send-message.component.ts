import { Component } from '@angular/core';
import { VoltarComponent } from '../shared/voltar/voltar.component';
import { BotServerService } from '../shared/services/bot-server.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [CommonModule, VoltarComponent, ReactiveFormsModule],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.sass'
})
export class SendMessageComponent {
  public sendMessageForm!: FormGroup;
  public to: string = "";
  public message: string = "";

  constructor(
    private botServerService: BotServerService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.sendMessageForm = fb.group({
      to: ["", Validators.required],
      message: ["", Validators.required],
    });
  }

  submitMessage() {
    this.to = this.sendMessageForm.value['to'];
    this.message = this.sendMessageForm.value["message"];

    if (this.to === "" && this.message === "")
      this.toastService.warning("Preencha os dados do formulário");

    this.botServerService.sendMessage(this.to, this.message).subscribe({
      next: data => {
        console.log(data);
        this.sendMessageForm.reset();
        this.toastService.success(data.message);
      },
      error: error => {
        console.error(error);
        this.toastService.error(error.message);
      }
    });
  }
}
