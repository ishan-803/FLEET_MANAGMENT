import { Injectable } from '@angular/core';
import { Technician } from '../models/technician.model';
import { ServiceAssignment } from '../models/assignment.model';
// import { CommonService } from './common-service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError, of } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class TechnicianService {
  private technicians: Technician[] = [];
  private assignments: ServiceAssignment[] = [];
  constructor(private http: HttpClient) {}
  private API_BASE = environment.apiBaseUrl;

  getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(`${this.API_BASE}/api/register`).pipe(
      catchError((err) => {
        console.error('Failed to fetch technicians:', err);
        return of([] as Technician[]);
      })
    );
  }

  addTechnician(technician: Technician): Technician {
    const id = technician._id;
    if (!id || id.trim() === '') {
      throw new Error('Technician _id must be a non-empty string.');
    }

    if (this.technicians.some((t: Technician) => t._id === id)) {
      throw new Error('Technician _id must be unique.');
    }

    const newTech = { ...technician };
    this.technicians.push(newTech);
    return { ...newTech };
  }

  getAssignments(): Observable<ServiceAssignment[]> {
    return this.http.get<ServiceAssignment[]>(`${this.API_BASE}/api/technician/assignments`).pipe(
      catchError((err) => {
        console.error('Failed to fetch assignments:', err);
        return of([] as ServiceAssignment[]);
      })
    );
  }
  assignServiceToTechnician(payload: { serviceId: string }): Observable<any> {
    return this.http.post(`${this.API_BASE}/api/technician/assignments`, payload);
  }
  getTechnicianName(id: string): string {
    const tech = this.technicians.find((t) => t._id === id);
    return tech ? `${tech.firstName} ${tech.lastName}` : 'Unknown';
  }

  assignTask(assignment: ServiceAssignment): ServiceAssignment {
    if (!assignment._id || typeof assignment._id !== 'string' || assignment._id.trim() === '') {
      throw new Error('Service ID is required and cannot be empty.');
    }

    const newAssignment = { ...assignment };
    this.assignments.push(newAssignment);
    return { ...newAssignment };
  }

  updateAssignmentStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.API_BASE}/api/technician/assignments/${id}/status`, { status });
  }

  getUnassignedServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/technician/unassigned-services`);
  }

  getTechnicianIdFromCredential(credentialId: string): Observable<string | null> {
    return this.http.get<Technician[]>(`${this.API_BASE}/technicians`).pipe(
      map((techs) => {
        const match = techs.find((t) => t.credential === credentialId);
        return match?._id ?? null;
      }),
      catchError((err) => {
        console.error('Failed to fetch technicians:', err);
        return of(null);
      })
    );
  }
}
