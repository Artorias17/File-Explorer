import { Injectable } from '@angular/core';
import { from, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private electronApi: ElectronApi | null;
  constructor() {
    this.electronApi = window.electronApi;
  }

  get isElectron(): boolean {
    return !!this.electronApi;
  }

  goToHome() {
    if (this.isElectron && this.electronApi?.goToDesktop) {
      return from(this.electronApi?.goToDesktop());
    }
    return of(null);    
  }

  goToDirectory(path: string) {
    if (this.isElectron && this.electronApi?.goToDir) {
      return from(this.electronApi?.goToDir(path));
    }
    return of(null);    
  }
}