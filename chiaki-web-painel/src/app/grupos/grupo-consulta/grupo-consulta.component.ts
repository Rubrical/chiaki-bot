import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoltarComponent } from '../../shared/voltar/voltar.component';
import { CommonModule } from '@angular/common';
import { GrupoConsultaService } from '../../shared/services/grupo-consulta.service';
import { ToastService } from '../../shared/services/toast.service';
import { GroupReport } from '../../shared/models/group-report';
import { MessagesService } from '../../shared/services/messages.service';
import { Message } from '../../shared/models/message';

@Component({
  selector: 'app-grupo-consulta',
  standalone: true,
  imports: [VoltarComponent, CommonModule],
  templateUrl: './grupo-consulta.component.html',
  styleUrl: './grupo-consulta.component.sass'
})
export class GrupoConsultaComponent implements OnInit{
  private groupId = "";
  grupoConsulta?: GroupReport;
  goodbyeMessage?: Message;
  welcomeMessage?: Message;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoConsultaService: GrupoConsultaService,
    private messagesService: MessagesService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');

    if (groupId) {
      this.groupId = groupId;

      // get group data
      this.grupoConsultaService.groupReport(groupId).subscribe({
        next: response => {
          this.grupoConsulta = response;
          const groupName = this.grupoConsulta?.groupName;


          // get Message group data
          if (groupName) {

            this.messagesService.getWelcomeMessage(groupName).subscribe({
              next: response => {
                this.welcomeMessage = response;
              },
              error: err => {
                console.error(err);
              }
            });

            this.messagesService.getGoodbyeMessage(groupName).subscribe({
              next: response => {
                this.goodbyeMessage = response;
              },
              error: err => {
                console.error(err);
              }
            });
          }
        },
        error: err => {
          console.error(err);
          this.toastService.warning('Não consegui buscar as informações deste grupo');
        }
      });
    } else {
      this.toastService.warning("Id do grupo não fornecido")
    }
  }

  goToRank() {
    this.router.navigate(["rank-grupo", this.groupId]);
  }

  goToGroupUserList() {
    this.router.navigate(["grupo-usuario-lista", this.groupId]);
  }

  goToBans() {
    this.router.navigate(["grupo-consulta/bans/", this.groupId]);
  }

  goToAdvertences() {
    this.router.navigate(["advertencia/advertencia-lista-grupo", this.groupId])
  }

}
