import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Input() placeholder = "";
  @Input() label = "";
  @Input() searchTerm = "";
  @Output() searchTermChange = new EventEmitter<string>();
  searchTermSubject = new Subject<string>();

  ngOnInit() {
    this.searchTermSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((value: string) => {
      this.searchTermChange.emit(value);
    })
  }

  publishSearchTerm(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim();
    this.searchTermSubject.next(this.searchTerm);
  }
}
