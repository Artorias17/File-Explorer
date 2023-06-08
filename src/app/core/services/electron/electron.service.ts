import { Injectable } from '@angular/core';
import { concatMap, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private electronApi: ElectronApi | null;
  constructor() {
    this.electronApi = window.electronApi;
  }

  get isElectron() {
    return !!this.electronApi;
  }

  goToHome() {
    if (this.isElectron && this.electronApi?.getHomeDir) {
      return from(this.electronApi.getHomeDir()).pipe(
        concatMap(this.goToDirectory.bind(this))
      );
    }
    return of(null);
  }

  goToDirectory(path: string) {
    if (this.isElectron && this.electronApi?.goToDir) {
      return from(this.electronApi.goToDir(path));
    }
    return of(null);
  }

  searchDir(directory: string, searchTerm: string) {
    if (this.isElectron && this.electronApi?.searchDir) {
      console.log(searchTerm);
      return from(this.electronApi.searchDir(directory ,searchTerm));
    }
    return of(null);
  }
}
