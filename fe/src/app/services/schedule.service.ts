import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { VehicleService } from './vehicle.service';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ServiceSchedulingDataService {
  constructor(
    private vehicleService: VehicleService,
    private http: HttpClient
  ) {}
  private API_BASE = environment.apiBaseUrl;

  loadScheduledServices() {
    return this.getScheduledServices();
  }

  fetchUnassignedServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/scheduling/unassigned`).pipe(
      catchError((err) => {
        console.error('Error fetching unassigned services:', err);
        return throwError(() => err);
      })
    );
  }
  /** Load unassigned services → mapped to NewVehicle[] */
  loadAvailableVehicles() {
    return this.fetchUnassignedServices().pipe(
      map((res: any) =>
        (res.unassigned_services || []).map((s: any) => ({
          type: s.vehicleType || '',
          make: s.vehicleMake || '',
          model: s.vehicleModel || '',
          year: s.vehicleYear || null,
          VIN: s.vehicleVIN,
          lastServiceDate: s.lastServiceDate || null,
          serviceType: s.serviceType || '',
          nextServiceMileage: null,
          hasOpenUnpaidService: false,
        }))
      )
    );
  }

  fetchAvailableTechniciansForCard(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/scheduling/available-technicians`);
  }
  /** Load technicians available today */
  loadAvailableTechniciansToday() {
    return this.fetchAvailableTechniciansForCard().pipe(map((res: any) => res.technician || []));
  }

  fetchAvailableTechnicians(serviceType: string): Observable<any> {
    return this.http
      .get<any>(
        `${this.API_BASE}/api/scheduling/available-technicians?serviceType=${encodeURIComponent(
          serviceType
        )}`
      )
      .pipe(
        catchError((err) => {
          console.error('Error fetching available technicians:', err);
          return throwError(() => err);
        })
      );
  }
  /** Load technicians filtered by service type */
  loadTechniciansByServiceType(serviceType: string) {
    return this.fetchAvailableTechnicians(serviceType).pipe(
      map((res: any) =>
        res.technician.map((t: any) => ({
          name: t.name,
          _id: t._id,
          expertise: t.expertise, // ✅ REQUIRED
          isSelectable: true,
        }))
      )
    );
  }

  getScheduledServices(): Observable<any[]> {
    return this.http.get<any>(`${this.API_BASE}/api/scheduling/scheduledServices`).pipe(
      map((res) => res.scheduled_services || []),
      catchError((err) => {
        console.error('Error fetching scheduled services:', err);
        return of([]);
      })
    );
  }

  scheduleService(payload: {
    vehicleVIN: string;
    serviceType: string;
    technicianId: string;
    dueServiceDate: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/scheduling/schedule`, payload).pipe(
      catchError((err) => {
        console.error('Error scheduling service:', err);
        return throwError(() => err);
      })
    );
  }
  getLatestOdometer(vin: string) {
    return this.vehicleService
      .getOdometerReadings()
      .filter((r) => r.vin === vin)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }
}
