import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CommonService } from '../services/common-service';

export const isLoggedInGuard: CanActivateFn = () => {
  const commonService = inject(CommonService);
  const router = inject(Router);

  if (commonService.getRole() !== null) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export function hasRole(expectedRole: 'admin' | 'technician'): CanActivateFn {
  return () => {
    const commonService = inject(CommonService);
    const router = inject(Router);
    const currentRole = commonService.getRole();

    if (currentRole === expectedRole) {
      return true;
    }
    if (currentRole === 'admin') {
      router.navigate(['/admin']);
    } else if (currentRole === 'technician') {
      router.navigate(['/technician']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  };
}