import { Component } from '@angular/core';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss'
})

export class MainPage {
  public userName: string | null = null;
  public constructor(private authService : Auth) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userName = user.userName;
        this.authService.setUser(user.userName);
      },
      error: () => {
        this.userName = null;
        this.authService.setUser(null);
      }
    });
  }
}
