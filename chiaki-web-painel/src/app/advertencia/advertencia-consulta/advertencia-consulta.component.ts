import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Advertence } from '../../shared/models/advertence';
import { AdvertenciaService } from '../../shared/services/advertencia.service';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-advertencia-consulta',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './advertencia-consulta.component.html',
  styleUrl: './advertencia-consulta.component.sass'
})
export class AdvertenciaConsultaComponent implements OnInit {
advertence?: Advertence;
  advertenceId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private advertenciaService: AdvertenciaService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) {
        this.toastService.warning('ID de advertência não informado.');
        this.router.navigate(['/advertencia/advertencia-lista']);
        return;
      }
      this.advertenceId = +idParam;
      this.loadAdvertence();
    });
  }

  loadAdvertence(): void {
    this.advertenciaService.getBydId(this.advertenceId).subscribe({
      next: response => {
        this.advertence = response;
      },
      error: err => {
        console.error(err);
        if (err.error.messsage) {
          this.toastService.warning(err.error.messsage);
        }
        this.toastService.error('Erro ao carregar a advertência.');
        this.router.navigate(['/advertencia/advertencia-lista']);
      }
    });
  }
}
