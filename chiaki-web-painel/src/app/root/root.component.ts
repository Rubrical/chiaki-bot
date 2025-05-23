import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VoltarComponent } from '../shared/voltar/voltar.component';
import { RootService } from '../shared/services/root.service';
import { AuthService } from '../shared/services/auth.service';
import { ToastService } from '../shared/services/toast.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-root',
  standalone: true,
  imports: [CommonModule, VoltarComponent, ReactiveFormsModule],
  templateUrl: './root.component.html',
  styleUrl: './root.component.sass'
})
export class RootComponent implements OnInit {
  rootId?: number;
  authForm!: FormGroup;

  constructor(
    private location: Location,
    private rootService: RootService,
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.authForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    const id = this.authService.getRootId();

    if (!id) {
      this.toastService.warning('Não foi possível resgatar informações da sua sessão');
      return;
    }

    this.rootId = id;
  }

  updateRoot() {
    if (this.authForm.invalid) {
      this.toastService.warning('Preencha todos os campos corretamente');
      return;
    }

    const { username, password } = this.authForm.value;

    this.rootService.updateRoot(this.rootId!, { username, password }).subscribe({
      next: res => {
        console.log(res);
        this.toastService.success('Credenciais atualizadas com sucesso');
      },
      error: err => {
        console.error(err);
        if (err.error?.message) {
          this.toastService.warning(err.error.message);
        } else {
          this.toastService.error('Erro ao atualizar credenciais');
        }
      },
      complete: () => {
        this.location.back();
      }
    });
  }
}
