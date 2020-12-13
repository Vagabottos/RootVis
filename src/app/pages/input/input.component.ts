import { Component, OnInit } from '@angular/core';
import { RootlogService } from '../../rootlog.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {

  game = '';
  validRootlog = false;

  constructor(private rootlogService: RootlogService) {}

  gameChange(): void {
    this.validRootlog = this.rootlogService.isValidGame(this.game);
  }

  getEncodedGame(): string {
    return btoa(this.game);
  }

}
