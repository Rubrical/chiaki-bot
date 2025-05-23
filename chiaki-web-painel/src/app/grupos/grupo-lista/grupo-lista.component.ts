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
}
