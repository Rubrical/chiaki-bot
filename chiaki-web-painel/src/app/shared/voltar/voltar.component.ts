import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-voltar',
  standalone: true,
  imports: [],
  templateUrl: './voltar.component.html',
  styleUrl: './voltar.component.sass'
})
export class VoltarComponent {
  constructor(private location: Location) { }

  voltar() {
    this.location.back();
  }
}
