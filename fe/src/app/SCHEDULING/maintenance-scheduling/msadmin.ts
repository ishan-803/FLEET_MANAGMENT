import { Component, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UniversalSpinner } from '../../universal-spinner/universal-spinner';
import { ServiceSchedulingDataService } from '../../services/schedule.service';
import { NewVehicle } from '../../VEHICLE/interface/IVehicle';
// import { ServiceSchedulingDataService } from './service-scheduling.service';

@Component({
  selector: 'app-service-scheduling',
  standalone: true,
  templateUrl: './msadmin.html',
  styleUrls: ['./msadmin.css'],
  imports: [CommonModule, UniversalSpinner, ReactiveFormsModule, CommonModule],
})
export class ServiceSchedulingComponent implements OnInit {
  loading = true;
  currentPage = 1;
  perPage = 2;

  scheduleForm!: FormGroup;
  availableVehicles: any[] = [];
  techniciansForDropdown: any[] = [];
  techniciansAvailableToday: any[] = [];
  scheduledServicesList: any[] = [];

  nextServiceKmDisplay = '';
  nextServiceDateDisplay = '';

  serviceFrequency: any = {
    Car: { km: 10000, days: 180 },
    Truck: { km: 20000, days: 365 },
  };

  minDate!: string;

  constructor(private fb: FormBuilder, private dataService: ServiceSchedulingDataService) {}

  ngOnInit(): void {
    this.minDate = new Date().toISOString().split('T')[0];

    this.scheduleForm = this.fb.group({
      vin: [null, Validators.required],
      technician: [null, Validators.required],
      serviceType: [{ value: '', disabled: true }, Validators.required],
      dueDate: ['', Validators.required],
    });

    this.loadAllData();
  }

  get totalPages(): number {
    return Math.ceil(this.scheduledServicesList.length / this.perPage);
  }
  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get availableTechniciansCount() {
    return this.techniciansAvailableToday.length;
  }
  get scheduledServices() {
    let result = this.scheduledServicesList;
    const start = (this.currentPage - 1) * this.perPage;
    return result.slice(start, start + this.perPage);
  }

  /** Load all dropdown + table data */
  loadAllData() {
    this.loading = true;
    this.currentPage = 1;

    this.dataService.loadAvailableVehicles().subscribe((v) => (this.availableVehicles = v));
    this.dataService
      .loadAvailableTechniciansToday()
      .subscribe((t) => (this.techniciansAvailableToday = t));
    this.dataService.loadScheduledServices().subscribe((s) => {
      this.scheduledServicesList = s;
      this.loading = false;
    });
  }

  /** When VIN changes */
  vehicleChanged(vin: string) {
    const vehicle = this.availableVehicles.find((v) => v.VIN === vin);
    if (!vehicle) return;

    this.scheduleForm.patchValue({ serviceType: vehicle.serviceType });

    const freq = this.serviceFrequency[vehicle.type];
    const latest = this.dataService.getLatestOdometer(vin);

    const lastMileage = latest?.mileage ?? 0;
    this.nextServiceKmDisplay = (lastMileage + freq.km).toString();

    const lastDate = new Date(vehicle.lastServiceDate);
    lastDate.setDate(lastDate.getDate() + freq.days);
    this.nextServiceDateDisplay = lastDate.toISOString().split('T')[0];

    this.dataService
      .loadTechniciansByServiceType(vehicle.serviceType)
      .subscribe((t) => (this.techniciansForDropdown = t));
  }

  /** Submit service */
  submitService() {
    if (this.scheduleForm.invalid) return;

    const form = this.scheduleForm.getRawValue();
    const tech = this.techniciansForDropdown.find((t) => t.name === form.technician);

    const payload = {
      vehicleVIN: form.vin,
      serviceType: form.serviceType,
      technicianId: tech?._id ?? '',
      dueServiceDate: new Date(form.dueDate).toISOString(),
    };

    this.dataService.scheduleService(payload).subscribe(() => {
      this.scheduleForm.reset();
      this.techniciansForDropdown = [];
      this.scheduleForm.patchValue({ technician: null });
      this.nextServiceKmDisplay = '';
      this.nextServiceDateDisplay = '';
      this.loadAllData();
    });
  }
}
