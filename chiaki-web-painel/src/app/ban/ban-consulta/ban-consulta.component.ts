import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BanService } from '../../shared/services/ban.service';
import { ToastService } from '../../shared/services/toast.service';
import { Ban } from '../../shared/models/ban';
import { CommonModule, Location } from '@angular/common';
import { VoltarComponent } from '../../shared/voltar/voltar.component';

@Component({
  selector: 'app-ban-consulta',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './ban-consulta.component.html',
  styleUrl: './ban-consulta.component.sass'
})
export class BanConsultaComponent implements OnInit {
  ban?: Ban;
  userRemoteJid: string | null = null;
  groupRemoteJid: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private banService: BanService,
    private toastService: ToastService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const userRemoteJid = this.route.snapshot.queryParamMap.get('userRemoteJid');
    const groupRemoteJid = this.route.snapshot.queryParamMap.get('groupRemoteJid');
    this.userRemoteJid = userRemoteJid;
    this.groupRemoteJid = groupRemoteJid;

    if (userRemoteJid && groupRemoteJid) {
      this.banService.getBan(userRemoteJid, groupRemoteJid).subscribe({
        next: response => {
          this.ban = response;
        },
        error: err => {
          console.error(err);
          if (err.error.message) {
            this.toastService.warning(err.error.message);
          } else {
            this.toastService.error("Erro ao carregar ban");
          }
        }
      });
    } else {
      this.toastService.warning("Id do usuário e do grupo não fornecidos");
      return;
    }
  }

  removeBan() {
    if (this.groupRemoteJid && this.userRemoteJid) {
      this.banService.removeBan(this.userRemoteJid, this.groupRemoteJid).subscribe({
        next: response => {
          if (response === true) {
            this.toastService.success("Ban removido com sucesso!");
            this.location.back();
          }
        },
        error: err => {
          console.error(err);
          if (err.error.message) {
            this.toastService.warning(err.error.message);
            return;
          }

          this.toastService.error("Um erro inesperado aconteceu!");
          return;
        },
      });
    }

  }

}
