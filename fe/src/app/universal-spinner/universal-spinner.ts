import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-universal-spinner',
  imports: [CommonModule],
  templateUrl: './universal-spinner.html',
  styleUrl: './universal-spinner.css',
})
export class UniversalSpinner {
@Input() show = false;
}
