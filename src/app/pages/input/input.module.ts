import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InputRoutingModule } from './input-routing.module';
import { InputComponent } from './input.component';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [InputComponent],
  imports: [
    CommonModule,
    FormsModule,
    InputRoutingModule,
    SharedModule
  ]
})
export class InputModule { }
