import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common-service';

@Component({
  selector: 'app-redirect',
  template: '',
})
export class RedirectComponent implements OnInit {
  constructor(private router: Router, private commonService: CommonService) {}

  ngOnInit(): void {
    const role = this.commonService.getRole();

    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'technician') {
      this.router.navigate(['/technician']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
