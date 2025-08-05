import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-startup',
  imports: [
    RouterModule
  ],
  templateUrl: './startup.html',
  styleUrl: './startup.scss'
})
export class Startup implements OnInit {
  constructor(private router: Router) {}

    ngOnInit(): void {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 5000);
    }
}
