import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { ToastService } from '../../shared/services/toast.service';
import { Router } from '@angular/router';
import { AdvertenciaService } from '../../shared/services/advertencia.service';
import { Advertence } from '../../shared/models/advertence';

@Component({
  selector: 'app-advertencia-lista',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './advertencia-lista.component.html',
  styleUrl: './advertencia-lista.component.sass'
})
export class AdvertenciaListaComponent implements OnInit {
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;
  activeAdvertences = false;
  advertencesList?: Advertence[];

  constructor(
    private router: Router,
    private toastService: ToastService,
    private advertenciaService: AdvertenciaService,
  ) { }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.pageNumber = page;
    this.advertenciaService.getListPaginate(this.pageSize, this.pageNumber, this.activeAdvertences).subscribe({
      next: response => {
        this.advertencesList = response.data;
        this.totalPages = response.totalPages || 0;
      },
      error: err => {
        console.error(err);
        if (err.error?.message) {
          this.toastService.warning(err.error.message);
        } else {
          this.toastService.error("Um erro inesperado ocorreu");
        }
      },
    });
  }

  consult(advertenceId: number) {
    this.router.navigate(['advertencia/advertencia-consulta', advertenceId])
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
