import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmbedRoutingModule } from './embed-routing.module';
import { EmbedComponent } from './embed.component';
import { SharedModule } from '../../shared.module';


@NgModule({
  declarations: [EmbedComponent],
  imports: [
    CommonModule,
    EmbedRoutingModule,
    SharedModule
  ]
})
export class EmbedModule { }
