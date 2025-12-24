import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../services/common-service';
import { UniversalSpinner } from '../universal-spinner/universal-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule , UniversalSpinner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: { title: string; count: number; color: string }[] = [];

  constructor(private commonService: CommonService) {}
  loading = true;
  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
    this.commonService.getDashboardSummary().subscribe({
      next: (summary) => {
        // console.log('Dashboard summary:', summary);
        this.stats = [
          { title: 'Total Vehicles', count: summary.totalVehicals, color: 'blue' },
          { title: 'Scheduled Services', count: summary.scheduledServices, color: 'yellow' },
          { title: 'In Progress', count: summary.inProgress, color: 'orange' },
          { title: 'Completed', count: summary.completed, color: 'green' },
          { title: 'Busy Technicians', count: summary.activeTechnicians, color: 'purple' },
          { title: 'Total Technicians', count: summary.totalTechnicians, color: 'red' },
        ];
        this.loading = false;
      },
      error: (err) => {
        // console.error('Failed to load dashboard summary:', err);
        this.loading = false;
      },
    });
  });
  }
}
