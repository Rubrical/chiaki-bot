import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../services/toast.service';
import { Subscription } from 'rxjs';


export type ToastType = 'success' | 'error' | 'warning';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.sass'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' })),
      ]),
    ]),
  ]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  remove(id: number) {
    this.toastService.remove(id);
  }

  toastClass(type: string): string {
    switch (type) {
      case 'success': return 'text-bg-success';
      case 'error': return 'text-bg-danger';
      case 'warning': return 'text-bg-warning';
      default: return 'text-bg-danger';
    }
  }
}
