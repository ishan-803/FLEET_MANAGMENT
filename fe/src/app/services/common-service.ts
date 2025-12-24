import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private API_BASE = environment.apiBaseUrl;
  public token: string | null = null;
  private storedRole: 'admin' | 'technician' | null = null;
  private loggedInEmail: string | null = null;

  constructor(private http: HttpClient) {}

  // ✅ Login
  apiLogin(email: string, password: string): Observable<boolean> {
    const normalizedEmail = (email || '').trim().toLowerCase();

    return this.http.post<any>(`${this.API_BASE}/auth/login`, { email: normalizedEmail, password }).pipe(
      map(res => {
        this.token = res.token;
        this.storedRole = res.role || null;

        if (this.token) {
          sessionStorage.setItem('token', this.token);

          try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            if (payload.id) {
              sessionStorage.setItem('technicianId', payload.id);
            } else {
              console.warn('Token payload does not contain id');
            }
          } catch (e) {
            console.error('Failed to decode token payload:', e);
          }
        }

        if (this.storedRole) {
          sessionStorage.setItem('role', this.storedRole);
        } else {
          sessionStorage.removeItem('role');
        }

        return true;
      }),
      catchError(err => {
        this.token = null;
        this.storedRole = null;

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('technicianId');
        console.error('API login failed', err);

        return of(false);
      })
    );
  }

  // ✅ Register Technician
  registerTechnicianApi(payload: any): Observable<any> {
    if (payload && payload.email) {
      payload.email = String(payload.email).trim().toLowerCase();
    }

    return this.http.post<any>(`${this.API_BASE}/api/register`, payload).pipe(
      map(res => res),
      catchError(err => {
        console.error('Register technician API failed', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Logout
  logout(): void {
    this.http.post(`${this.API_BASE}/auth/logout`, {}).subscribe({
      next: () => {
        this.loggedInEmail = null;
        this.token = null;
        this.storedRole = null;
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('technicianId');
      },
      error: (err) => console.error('Logout error:', err),
    });
  }

  // ✅ Role getter
  getRole(): 'admin' | 'technician' | null {
    const fromStorage = sessionStorage.getItem('role') as 'admin' | 'technician' | null;
    if (fromStorage) return fromStorage;
    if (this.storedRole) return this.storedRole;
    return null;
  }

  // ✅ Service catalog
  private serviceCatalog = [
    { name: 'Oil Change', cost: 12000 },
    { name: 'Brake Repair', cost: 6000 },
    { name: 'Battery Test', cost: 15000 },
  ];

  getServiceCost(serviceType: string): number {
    const service = this.serviceCatalog.find((s) => s.name === serviceType);
    return service ? service.cost : 0;
  }

  // ✅ Dashboard summary
  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/dashboard/summary`);
  }
}
