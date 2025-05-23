import { Component, OnInit } from '@angular/core';
import { GroupRank } from '../../shared/models/group-rank';
import { GrupoConsultaService } from '../../shared/services/grupo-consulta.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-grupo-rank',
  standalone: true,
  imports: [CommonModule, VoltarComponent, FormsModule],
  templateUrl: './grupo-rank.component.html',
  styleUrl: './grupo-rank.component.sass'
})
export class GrupoRankComponent implements OnInit {
  groupId = '';
  groupRank: GroupRank[] = [];
  numeroSelecionado = 5;

  constructor(
    private grupoConsultaService: GrupoConsultaService,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');

    if (groupId) {
      this.groupId = groupId;
      this.grupoConsultaService.getRank(groupId).subscribe({
        next: response => {
          if (response.length === 0) {
            this.toastService.warning("Não nenhum usuário no grupo")
          }
          this.groupRank = response;
        },
        error: err => {
          console.error(err);
          if (err.error.message) {
            this.toastService.warning(err.error.message);
          } else {
            this.toastService.error("Não foi possível carregar o rank do grupo")
          }
        },
      });
    } else {
      this.toastService.warning("Id do grupo não fornecido");
    }
  }

  carregarRank(): void {
    this.grupoConsultaService.getRank(this.groupId, this.numeroSelecionado).subscribe({
      next: response => {
        if (response.length === 0) {
          this.toastService.warning("Não há nenhum usuário no grupo");
        }
        this.groupRank = response;
      },
      error: err => {
        console.error(err);
        if (err.error.message) {
          this.toastService.warning(err.error.message);
        } else {
          this.toastService.error("Não foi possível carregar o rank do grupo");
        }
      }
    });
  }
}
