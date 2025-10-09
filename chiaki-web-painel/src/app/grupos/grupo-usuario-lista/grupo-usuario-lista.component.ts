import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { GrupoConsultaService } from '../../shared/services/grupo-consulta.service';
import { Usuario } from '../../shared/models/usuario';
import { CommonModule } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-grupo-usuario-lista',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './grupo-usuario-lista.component.html',
  styleUrl: './grupo-usuario-lista.component.sass'
})
export class GrupoUsuarioListaComponent implements OnInit {
  groupId = "";
  totalPages = 0;
  pageSize = 10;
  pageNumber = 1;
  usuarioLista: Usuario[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private grupoConsultaService: GrupoConsultaService,
  ) {}

    ngOnInit(): void {
      const groupId = this.route.snapshot.paramMap.get('id');
      if (groupId) {
        this.groupId = groupId;
        this.loadPage(1);
      } else {
        this.toastService.warning("Id do Grupo não fornecido");
      }
    }

  loadPage(page: number): void {
    if (page < 1) return;
    this.grupoConsultaService.getUsersFromGroup(this.groupId, this.pageSize, page).subscribe({
      next: response => {
        this.usuarioLista = response.data;
        this.pageNumber = page;
        this.totalPages = response.total;
      },
      error: err => {
        console.error(err);
        if (err.error.message) {
          this.toastService.warning(err.error.message);
        }
      },
    });
  }

  consult(userId: string): void {
    this.router.navigate(['usuario/usuario-consulta/', userId]);
  }

  isNumber(value: any): value is number {
    return typeof value === 'number';
  }

  isString(value: any): value is string {
    return typeof value === 'string';
  }

  getPages(): (number | string)[] {
    const totalPages = this.totalPages;
    const currentPage = this.pageNumber;
    const maxPages = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > maxPages - 2) pages.push('...');

    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= 3) {
      startPage = 2;
      endPage = maxPages - 1;
    }

    if (currentPage >= totalPages - 2) {
      startPage = totalPages - maxPages + 2;
      endPage = totalPages - 1;
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);

    if (currentPage < totalPages - (maxPages - 3)) pages.push('...');

    pages.push(totalPages);
    return pages;
  }
}
