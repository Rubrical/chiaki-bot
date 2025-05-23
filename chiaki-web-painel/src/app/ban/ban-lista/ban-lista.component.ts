import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ban } from '../../shared/models/ban';
import { BanService } from '../../shared/services/ban.service';
import { ToastService } from '../../shared/services/toast.service';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-grupo-ban-lista',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './ban-lista.component.html',
  styleUrl: './ban-lista.component.sass'
})
export class BanListaComponent implements OnInit {
  banList?: Ban[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private banService: BanService,
  ) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.pageNumber = page;

    this.banService.getBansPaginate(this.pageNumber, this.pageSize).subscribe({
      next: response => {
        console.log(response);
        this.banList = response.data;
        this.totalPages = response.total || 0;
      },
      error: err => {
        console.error(err);
        this.toastService.error("Erro ao carregar lista paginada.");
      }
    });
  }

  consult(userRemoteJid: string, groupRemoteJid: string) {
    this.router.navigate(["ban/ban-consulta"], {
      queryParams: { userRemoteJid, groupRemoteJid }
    });
  }
}
