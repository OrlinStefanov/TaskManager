import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class Helper {
  
}

export function showAlert(component: any, type: 'success' | 'danger', message: string) {
  component.alertType = type;
  component.message = message;

  setTimeout(() => {
    component.message = '';
    component.alertType = '';
  }, 5000);
}
