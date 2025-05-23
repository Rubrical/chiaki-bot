import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { UsuarioService } from '../../shared/services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';
import { UserReport } from '../../shared/models/user-report';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-usuario-consulta',
  standalone: true,
  imports: [CommonModule, VoltarComponent],
  templateUrl: './usuario-consulta.component.html',
  styleUrl: './usuario-consulta.component.sass',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0px',
        overflow: 'hidden',
        opacity: 0,
      })),
      state('expanded', style({
        height: '*',
        opacity: 1,
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ]),
    ]),
  ]
})
export class UsuarioConsultaComponent implements OnInit {
  remoteJid: string | null = "";
  usuarioReport?: UserReport;
  exibirGrupos = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsuarioService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const remoteJid = this.route.snapshot.paramMap.get('id');
    this.remoteJid = remoteJid;

    if (remoteJid) {
      this.userService.getUser(remoteJid).subscribe({
        next: response => {
          console.log(response);
          this.usuarioReport = response;
        },
        error: err => {
          console.error(err);
          if (err.error.message) {
            this.toastService.warning(err.error.message);
          } else {
            this.toastService.error("Erro ao buscar usuário");
          }
        },
      });
    } else {
      this.toastService.warning("Id do usuário não disponibilizado");
    }
  }

  alternarExibirGrupos() {
    this.exibirGrupos = !this.exibirGrupos;
  }

  consultarGrupo(groupId: string|undefined) {
    if (!groupId) {
      this.toastService.warning("Não é possível consultar grupo");
      return;
    }
    this.router.navigate(["grupo-consulta", groupId]);
  }

  consultarAdvertencias() {
    this.router.navigate(['advertencia/advertencia-lista-usuario', this.remoteJid]);
  }
}
