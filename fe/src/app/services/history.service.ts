import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class HistoryService {
      constructor(private http: HttpClient) {}
  private API_BASE = environment.apiBaseUrl;

   getUnpaidCompletedAssignments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/history/unpaidAssignments`);
  }

   
addCompletedRecord(serviceId: string, cost: number): Observable<any> {
  const payload = { serviceId, paymentStatus: 'Paid', cost };
  return this.http.post(`${this.API_BASE}/api/history/addService`, payload);
}


    getServiceHistories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/history/allHistories`);
  }
}