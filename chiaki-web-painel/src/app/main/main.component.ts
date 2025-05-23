import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  standalone: true
})
export class MainComponent implements OnInit {
  ownerName: null | string = '';
  authService = inject(AuthService);
  toastService = inject(ToastService);
  navigationLinks = [
    { label: 'Ler QR Code', route: '/qrcode' },
    { label: 'Grupos', route: '/grupos-lista' },
    { label: 'Usuários', route: 'usuario/usuario-lista'},
    { label: 'Advertências', route: 'advertencia/advertencia-lista' },
    { label: 'Bans', route: 'bans/ban-lista' },
    { label: 'Mensagens', route: 'mensagens/mensagem-lista' },
    { label: 'Editar Login', route: 'editar-administrador' },
    { label: 'Sair', route: '/auth' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.ownerName = this.authService.getUsername();
    this.toastService.success(`Bem-vindo, ${this.ownerName}!`);
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }
}
