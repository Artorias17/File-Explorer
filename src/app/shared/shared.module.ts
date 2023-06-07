import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from './components';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './components';

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
