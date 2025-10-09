import { Component, OnInit } from '@angular/core';
import { GrupoListaService } from '../../shared/services/grupo-lista.service';
import { GroupsList } from '../../shared/models/groups-list';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-grupo-lista',
  standalone: true,
  imports: [VoltarComponent, CommonModule],
  templateUrl: './grupo-lista.component.html',
  styleUrl: './grupo-lista.component.sass'
})
export class GrupoListaComponent implements OnInit {
  groupsNumber: number = 0;
  groupList: GroupsList[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(
    private groupListService: GrupoListaService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.groupListService.getCount().subscribe({
      next: response => this.groupsNumber = response,
      error: err => {
        console.error(err);
        if (err.error.message) {
          this.toastService.warning(err.error.message);
        }
      },
    });

    this.loadPage(this.pageNumber);
  }

  loadPage(page: number): void {
    this.groupListService.getLista(this.pageSize, page).subscribe({
      next: response => {
        this.totalPages = response.total;
        this.groupList = response.data;
        this.pageNumber = page;
      },
      error: err => {
        console.error(err);
        if (err.error.message) {
          this.toastService.warning(err.error.message);
        }
      }
    });
  }

  consult(groupId: string) {
    this.router.navigate(['/grupo-consulta', groupId]);
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
