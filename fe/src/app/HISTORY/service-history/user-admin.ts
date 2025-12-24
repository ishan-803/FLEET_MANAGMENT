import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../services/common-service';
import { UniversalSpinner } from '../../universal-spinner/universal-spinner';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, FormsModule , UniversalSpinner],
  templateUrl: './user-admin.html',
  styleUrls: ['./user-admin.css'],
})
export class UserAdmin implements OnInit {
  constructor(private commonService: CommonService , private historyService: HistoryService) {}
loading = true;
  currentPage = 1;
  perPage = 5;
  newVehicleId = '';
  newDate = '';
  newTechnician = '';
  newStatus = '';
  newType = '';
  newCost = 0;

  records: any[] = [];
  searchTerm = '';
  sortOrder: 'asc' | 'desc' | '' = '';
  dropdownEntries: any[] = [];

  ngOnInit(): void {
    this.refreshDropdownData();
    this.loadHistories();
  }

  // this data is appearing in the dropdown using the new controller
  refreshDropdownData(): void {
    this.historyService.getUnpaidCompletedAssignments().subscribe({
      next: (services) => {
        this.dropdownEntries = (services || []).map((service: any) => ({
          serviceId: service._id,
          vin: service.vehicleVIN,
          technician: service.technicianName || service.technicianId,
          serviceType: service.serviceType,
          date: service.assignmentDate,
          isCompleted: service.status === 'Completed',
        }));
      },
      error: (err) => console.error('Error loading unpaid assignments:', err),
    });
  }

  //table below to get all the records
  loadHistories(): void {
    this.historyService.getServiceHistories().subscribe({
      next: (histories: any[]) => {
        this.records = (histories || []).map((h: any) => ({
          date: h.createdAt,
          vehicleId: h.vehicleVIN,
          status: h.workStatus,
          type: h.serviceType,
          cost: h.cost,
          technician: h.technicianName || '—',
          paymentStatus: h.paymentStatus,
          paymentMethod: '—',
        }));
        this.loading = false
      },
      error: (err) => {
        console.error('Failed to load histories:', err);
        this.loading = false
      } 
    });
  }

  // --- Filtering and sorting ---
  get filteredRecords(): any[] {
    let result = this.records;

    if (this.searchTerm) {
      result = result.filter(r =>
        r.technician.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.sortOrder === 'asc') {
      result = [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (this.sortOrder === 'desc') {
      result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
   const start = (this.currentPage - 1) * this.perPage;
  return result.slice(start, start + this.perPage);
  }

  get totalPages(): number {
  return Math.ceil(this.records.length / this.perPage);
}


  addRecord(form: NgForm) {
    if (form.valid) {
      const selectedEntry = this.dropdownEntries.find(e => e.serviceId === this.newVehicleId);
      if (!selectedEntry) {
        alert('Error: Could not find selected service.');
        return;
      }

      const newRecord = {
        date: new Date(this.newDate),
        vehicleId: selectedEntry.vin,
        serviceId: this.newVehicleId,
        status: this.newStatus,
        type: this.newType,
        cost: this.newCost,
        technician: this.newTechnician,
        paymentStatus: 'Paid',   // ✅ default
        paymentMethod: '',
      };

      // ✅ Add to UI table immediately
      this.records.push(newRecord);

      // ✅ Update backend immediately
      this.historyService.addCompletedRecord(newRecord.serviceId, newRecord.cost).subscribe({
        // next: () => {
        //   // this.commonService.markTechnicianAvailable(newRecord.technician);
        // },
        error: (err) =>
          alert(`Failed to save record: ${err.error?.message || err.message}`)
      });
      form.resetForm();
      this.resetAutoPopulatedFields();
    }
  }

  resetAutoPopulatedFields(): void {
    this.newDate = '';
    this.newTechnician = '';
    this.newType = '';
    this.newCost = 0;
    this.newStatus = '';
  }

  onVehicleSelect(): void {
    const selectedEntry = this.dropdownEntries.find(entry => entry.serviceId === this.newVehicleId);
    if (selectedEntry) {
      this.newDate = selectedEntry.date
        ? new Date(selectedEntry.date).toISOString().split('T')[0]
        : '';
      this.newTechnician = selectedEntry.technician;
      this.newType = selectedEntry.serviceType;
      this.newCost = this.commonService.getServiceCost(selectedEntry.serviceType);
      this.newStatus = 'Completed';
    } else {
      this.resetAutoPopulatedFields();
    }
  }

  sortRecords(order: string) {
    if (order === 'asc') {
      this.records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (order === 'desc') {
      this.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }
}
