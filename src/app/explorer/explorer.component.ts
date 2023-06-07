import { Component } from '@angular/core';
import { ElectronService } from '../core/services';
import { Observable, filter, map } from 'rxjs';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
})
export class ExplorerComponent {
  currentDirectory: string = '';
  directoryHistroy: string[] = [];
  directoryHistoryIndex: number = -1;
  folders: FileOrFolder[] = [];
  files: FileOrFolder[] = [];

  constructor(private electronService: ElectronService) {}

  assignValues(
    observable: Observable<Payload | null>,
    moveHistoryIndexByUnit: -1 | 0 | 1 = 0
  ) {
    observable
      .pipe(
        filter((payload): payload is Payload => !!payload),
        map((payload) => {
          this.directoryHistoryIndex += moveHistoryIndexByUnit;
          return payload;
        })
      )
      .subscribe((content) => {
        this.folders = content.filesAndFolders.filter(
          (item) => item.isDirectory
        );
        this.files = content.filesAndFolders.filter(
          (item) => !item.isDirectory
        );
        this.currentDirectory = content.currentPath;
        if (moveHistoryIndexByUnit == 0) {
          this.directoryHistroy = this.directoryHistroy.slice(
            0,
            this.directoryHistoryIndex + 1
          );
          this.directoryHistroy.push(this.currentDirectory);
          if (this.directoryHistroy.length > 10) {
            this.directoryHistroy.splice(0, 1);
          }
          this.directoryHistoryIndex = this.directoryHistroy.length - 1;
        }
      });
  }

  ngOnInit() {
    this.assignValues(this.electronService.goToHome());
  }

  onDoubleClickDir(path: string) {
    this.assignValues(this.electronService.goToDirectory(path));
  }

  onGoBack() {
    this.assignValues(
      this.electronService.goToDirectory(
        this.directoryHistroy[this.directoryHistoryIndex - 1]
      ),
      -1
    );
    this.directoryHistoryIndex - 1;
  }

  onGoForward() {
    this.assignValues(
      this.electronService.goToDirectory(
        this.directoryHistroy[this.directoryHistoryIndex + 1]
      ),
      1
    );
  }
}
