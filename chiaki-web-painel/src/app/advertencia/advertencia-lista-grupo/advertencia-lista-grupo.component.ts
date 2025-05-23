import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { Advertence } from '../../shared/models/advertence';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvertenciaService } from '../../shared/services/advertencia.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-advertencia-lista-grupo',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './advertencia-lista-grupo.component.html',
  styleUrl: './advertencia-lista-grupo.component.sass'
})
export class AdvertenciaListaGrupoComponent implements OnInit {
  advertencesList?: Advertence[];
  pageNumber = 1;
  pageSize = 10;
  id = '';
  activeAdvertences = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private advertenciaService: AdvertenciaService,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadData();
  }

  loadData(): void {
    this.advertenciaService.getAllAdvertencesFromGroup({
      id: this.id,
      activeAdvertences: this.activeAdvertences,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }).subscribe({
      next: res => this.advertencesList = res,
      error: err => {
        console.error(err);
        if (err.error.message) {
          this.toastService.warning(err.error.message);
          return;
        }
        this.toastService.error('Erro ao carregar advertências do grupo');
      }
    });
  }

  consult(advertenceId: number): void {
    this.router.navigate(['/advertencia/advertencia-consulta', advertenceId]);
  }
}
