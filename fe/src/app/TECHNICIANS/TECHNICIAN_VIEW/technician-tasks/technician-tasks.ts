import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianService } from '../../../services/technician.service';
import { ServiceAssignment } from '../../../models/assignment.model';
import { FormatStatusPipe } from '../../../pipes/format-status-pipe';
import { Technician } from '../../../models/technician.model';
import { UniversalSpinner } from '../../../universal-spinner/universal-spinner';

@Component({
  selector: 'app-technician-tasks',
  standalone: true,
  imports: [CommonModule, FormatStatusPipe , UniversalSpinner],
  templateUrl: './technician-tasks.html',
  styleUrls: ['./technician-tasks.css'],
})
export class TechnicianTasksComponent implements OnInit {
  myAssignments: ServiceAssignment[] = [];
  allTechnicians: Technician[] = [];
  loading = true;
  constructor(private techService: TechnicianService) {}

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.techService.getAssignments().subscribe({
      next: (assignments) => {
        this.myAssignments = assignments;
        this.loading = false;
        // console.log('Assignments loaded:', assignments);
      },
      error: (err) => {
        console.error('Failed to load technician assignments:', err);
        this.loading = false;
      },
    });
  }

  updateStatus(assignmentId: string, newStatus: ServiceAssignment['status']): void {
    this.techService.updateAssignmentStatus(assignmentId, newStatus).subscribe({
      next: () => {
        alert(`Status for assignment updated successfully.`);
        this.loadAssignments();
      },
      error: (err) => {
        alert(`Error updating status: ${err.message}`);
      },
    });
  }
  getTechnicianName(id: string): string {
    return this.techService.getTechnicianName(id);
  }
}
