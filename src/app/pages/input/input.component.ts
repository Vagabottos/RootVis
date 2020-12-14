import { Component } from '@angular/core';
import { compressToEncodedURIComponent } from 'lz-string';

import { RootlogService } from '../../rootlog.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {

  game = '';
  validRootlog = false;

  gameUrl = '';
  validRootlogUrl = false;

  constructor(private rootlogService: RootlogService) {}

  gameChange(): void {
    this.validRootlog = this.rootlogService.isValidGame(this.game);
  }

  async gameUrlChange(): Promise<void> {
    try {
      const game = await this.rootlogService.getGameStringFromURL(this.gameUrl);
      this.validRootlogUrl = this.rootlogService.isValidGame(game);
    } catch {
      this.validRootlogUrl = false;
    }
  }

  getEncodedGame(): string {
    return compressToEncodedURIComponent(this.game);
  }

}
