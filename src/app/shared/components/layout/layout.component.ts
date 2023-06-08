import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  @Input()
  locations: OSLocation[] = []

  @Output()
  navigationChanged = new EventEmitter<string>();

  onNavigationChange(path: string) {
    this.navigationChanged.emit(`${path}`);
  }
}
