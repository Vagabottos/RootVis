import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullGameRoutingModule } from './full-game-routing.module';
import { FullGameComponent } from './full-game.component';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [FullGameComponent],
  imports: [
    CommonModule,
    FullGameRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class FullGameModule { }
