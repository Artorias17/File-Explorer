import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExplorerRoutingModule } from './explorer-routing.module';
import { ExplorerComponent } from './explorer.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { ListViewComponent } from './components/list-view/list-view.component';

@NgModule({
  declarations: [ExplorerComponent, ListViewComponent],
  imports: [CommonModule, ExplorerRoutingModule, MaterialModule, SharedModule],
})
export class ExplorerModule {}
