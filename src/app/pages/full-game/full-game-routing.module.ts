import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FullGameComponent } from './full-game.component';

const routes: Routes = [{ path: '', component: FullGameComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FullGameRoutingModule { }
