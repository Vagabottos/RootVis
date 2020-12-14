import { NgModule } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { VisualizerComponent } from './components/visualizer/visualizer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const modules = [
  CommonModule,
  FormsModule,
  MatToolbarModule,
  MatButtonModule,
  MatSliderModule,
  MatTooltipModule,
  MatInputModule,
  MatIconModule
];

const components = [
  VisualizerComponent
];

@NgModule({
  declarations: components,
  imports: modules,
  exports: [
    ...modules,
    ...components
  ]
})
export class SharedModule { }
