import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { BanList } from '../../shared/models/ban';
import { BanService } from '../../shared/services/ban.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-grupo-ban-lista',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './grupo-ban-lista.component.html',
  styleUrl: './grupo-ban-lista.component.sass'
})
export class GrupoBanListaComponent implements OnInit {
  banList?: BanList;
  groupId = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private banService: BanService,
  ) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');
    if (groupId) {
      this.groupId = groupId;
      this.banService.getBannedFromGroup(groupId).subscribe({
        next: response => {
          console.log(response);

          if (response.bannedQuantity === 0) {
            this.toastService.warning("Grupo Sem bans", 7000);
            return;
          }
          this.banList = response;
        },
        error: err => {
          console.error(err);
          if (err.error.message) {
            this.toastService.warning(err.error.message);
          } else {
            this.toastService.error("Erro ao buscar lista de ban do grupo");
          }
        }
      });
    }
  }

  consult(groupRemoteJid: string, userRemoteJid: string) {
    this.router.navigate(["ban/ban-consulta"], {
      queryParams: { groupRemoteJid, userRemoteJid }
    });
  }
}
