import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated() || !authService.isTokenValid()) {
    router.navigate(['/auth'], { queryParams: { mode: 'login' } });
    return false;
  }

  return true;
};
