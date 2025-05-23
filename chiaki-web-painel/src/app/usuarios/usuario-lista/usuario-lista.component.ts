import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { CommonModule } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { Usuario } from '../../shared/models/usuario';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './usuario-lista.component.html',
  styleUrl: './usuario-lista.component.sass'
})
export class UsuarioListaComponent implements OnInit {
  groupId = "";
  totalPages = 0;
  pageSize = 10;
  pageNumber = 1;
  usuarioLista: Usuario[] = [];

  constructor(
    private router: Router,
    private toastService: ToastService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (page < 1) return;
    this.usuarioService.getUserPaginate(this.pageSize, page).subscribe({
      next: response => {
        console.log(response);
        this.usuarioLista = response.data;
        this.pageNumber = page;
        this.totalPages = response.total;
      },
      error: err => {
        console.error(err);
        console.error(err);
        if (err.error.message) {
          this.toastService.warning(err.error.message);
        } else {
          this.toastService.error("Erro ao carregar usuários");
        }
      },
    });
  }

  consult(userId: string): void {
    this.router.navigate(['usuario/usuario-consulta/', userId]);
  }
}
