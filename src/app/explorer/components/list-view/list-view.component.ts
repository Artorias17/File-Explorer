import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent {
  @Input()
  folders: FileOrFolder[] = [];
  @Input()
  files: FileOrFolder[] = [];
  @Output()
  itemClickEvent = new EventEmitter<string>();
  
  onItemClicked(path: string) {
    this.itemClickEvent.emit(path);
  }
}
