import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Input() placeholder = "";
  @Input() label = "";
  @Output() searchTermChange = new EventEmitter<string>();
  searchTerm = new FormControl("");

  publishSearchTerm() {
    this.searchTermChange.emit(this.searchTerm.value?.trim() || "");
  }
}
