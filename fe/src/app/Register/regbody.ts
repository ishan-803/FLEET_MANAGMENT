import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonService } from '../services/common-service';
import { Router } from '@angular/router';
import { UniversalSpinner } from '../universal-spinner/universal-spinner';

@Component({
  selector: 'app-regbody',
  standalone: true,
  imports: [CommonModule, FormsModule , UniversalSpinner],
  templateUrl: './regbody.html',
  styleUrls: ['./regbody.css'],
})
export class Regbody {
  constructor(private commonService: CommonService, private router: Router) {}
  loading = false;
  formData = {
    firstName: '',
    lastName: '',
    skills: [] as string[],
    availability: [] as string[],
    email: '',
    password: '',
    confirmPassword: '',
  };

  showPassword = false;
  showConfirmPassword = false;

  skills = ['Oil Change', 'Brake Repair', 'Battery Test'];
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updateSelection(value: string, field: 'skills' | 'availability', isChecked: boolean): void {
    const list = this.formData[field];
    if (isChecked) {
      if (!list.includes(value)) list.push(value);
    } else {
      const index = list.indexOf(value);
      if (index > -1) list.splice(index, 1);
    }
  }

 onSubmit(form: NgForm) {
  if (!form.valid) {
    alert('Form is invalid. Please check your inputs.');
    return;
  }

  const { firstName, lastName, email, password, confirmPassword, skills, availability } =
    this.formData;

  if (
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword ||
    skills.length === 0 ||
    availability.length === 0
  ) {
    alert('All fields are required, including skills and availability.');
    return;
  }

  const emailPattern = /^[^\s@]+@fleet\.com$/;
  if (!emailPattern.test(email)) {
    alert('Email must end with @fleet.com');
    return;
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
  if (!passwordPattern.test(password)) {
    alert(
      'Password must be at least 6 characters and include one uppercase, one lowercase, one number, and one special character.'
    );
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  // ✅ Payload
  const techPayload = {
    firstName,
    lastName,
    skills,
    availability: availability.map((d) => d.toLowerCase()),
    email,
    password,
  };

  // ✅ Call API (Observable)
  this.loading = true;
  this.commonService.registerTechnicianApi(techPayload).subscribe({
    next: () => {
      this.loading = false; // manually reset here
      alert('Technician registered successfully!');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.loading = false; // manually reset here too
      console.error('Register API failed:', err);
      alert('Registration failed. Please try again.');
    },
  });
}

}
