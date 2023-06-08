import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { LayoutComponent } from './components/layout/layout.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SearchComponent } from './components/search/search.component';
import { WebviewDirective } from './directives/webview.directive';


@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    LayoutComponent,
    SearchComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    LayoutComponent,
    SearchComponent,
  ],
})
export class SharedModule {}
