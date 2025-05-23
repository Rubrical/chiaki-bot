import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastType } from '../toast/toast.component';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  delayMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts.asObservable();
  private counter = 0;

  private show(message: string, type: ToastType, delayMs: number) {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, delayMs };
    this._toasts.next([...this._toasts.getValue(), toast]);

    setTimeout(() => this.remove(id), delayMs);
  }

  success(message: string, delayMs: number = 5000) {
    this.show(message, 'success', delayMs);
  }

  error(message: string, delayMs: number = 5000) {
    this.show(message, 'error', delayMs);
  }

  warning(message: string, delayMs: number = 5000) {
    this.show(message, 'warning', delayMs);
  }

  remove(id: number) {
    const filtered = this._toasts.getValue().filter(t => t.id !== id);
    this._toasts.next(filtered);
  }
}
