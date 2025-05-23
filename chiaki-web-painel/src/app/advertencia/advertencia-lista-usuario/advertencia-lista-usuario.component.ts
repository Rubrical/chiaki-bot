import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Advertence } from '../../shared/models/advertence';
import { AdvertenciaService } from '../../shared/services/advertencia.service';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-advertencia-lista-usuario',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './advertencia-lista-usuario.component.html',
  styleUrl: './advertencia-lista-usuario.component.sass'
})
export class AdvertenciaListaUsuarioComponent {
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
    this.advertenciaService.getAllUserAdvertences({
      id: this.id,
      activeAdvertences: this.activeAdvertences,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }).subscribe({
      next: res => {
        this.advertencesList = res.data;
        console.log(res);
      },
      error: err => {
        console.error(err);
        this.toastService.error('Erro ao carregar advertências do usuário');
      }
    });
  }

  consult(advertenceId: number): void {
    this.router.navigate(['/advertencia/advertencia-consulta', advertenceId]);
  }
}
