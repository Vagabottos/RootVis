import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmbedComponent } from './embed.component';

const routes: Routes = [{ path: '', component: EmbedComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmbedRoutingModule { }
