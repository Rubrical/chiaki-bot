import { Component, OnInit } from '@angular/core';
import { Message } from '../../shared/models/message';
import { MessagesService } from '../../shared/services/messages.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-mensagem-lista',
  standalone: true,
  imports: [CommonModule, VoltarComponent, RouterLink],
  templateUrl: './mensagem-lista.component.html',
  styleUrl: './mensagem-lista.component.sass'
})
export class MensagemListaComponent implements OnInit {
  totalPages = 0;
  pageSize = 10;
  pageNumber = 1;
  mensagensLista: Message[] = [];
  getActive = true;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private messagesService: MessagesService
  ) { }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (page < 1) return;
    this.messagesService.getPaginated(this.pageSize, page, this.getActive).subscribe({
      next: response => {
        this.mensagensLista = response.data;
        this.pageNumber = page;
        this.totalPages = response.totalPages;
      },
      error: err => {
        console.error(err);
        if (err.error?.message) {
          this.toastService.warning(err.error.message);
        } else {
          this.toastService.error("Erro ao carregar mensagens");
        }
      },
    });
  }

  toggleActive(): void {
    this.getActive = !this.getActive;
    this.loadPage(1);
  }

  consult(chaveMensagem: string): void {
    this.router.navigate(['mensagens/mensagem-consulta', chaveMensagem]);
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
