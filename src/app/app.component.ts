import { Component, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { concatAll, filter } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  locations: OSLocation[] = [];

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      // console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      // console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit() {
    this.electronService.getHomeDir().pipe(filter((data): data is string => !!data)).
    subscribe((path) => {
      this.locations.push({
        icon: 'home',
        name: 'Home',
        path,
        description: '',
        volumeName: ''
      });
    })

    this.electronService
      .getDrives()
      .pipe(
        filter((data): data is OSDrive[] => !!data),
        concatAll()
      )
      .subscribe((drive) => {
        this.locations.push({
          icon: 'dns',
          name: drive.name,
          path: drive.name,
          description: drive.description,
          volumeName: drive.volumeName
        });
      });
  }

  navigateTo(path: string) {
    this.router.navigate(['.'], {queryParams: { location: path }});
  }
}
