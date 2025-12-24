import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../services/common-service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { UniversalSpinner } from '../universal-spinner/universal-spinner';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink, UniversalSpinner],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  loading = false;
  showPassword = false;

  constructor(private commonService: CommonService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const { email, password } = form.value;

      this.commonService.apiLogin(email, password).subscribe(success => {
        if (!success) {
          alert('Invalid credentials. Please try again.');
          return;
        }

        this.loading = true;

        const role = this.commonService.getRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'technician') {
          this.router.navigate(['/technician']);
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }
}
