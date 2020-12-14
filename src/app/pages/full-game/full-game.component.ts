import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { decompressFromEncodedURIComponent } from 'lz-string';

import { RootGame } from '@seiyria/rootlog-parser';
import { RootlogService } from '../../rootlog.service';

@Component({
  selector: 'app-full-game',
  templateUrl: './full-game.component.html',
  styleUrls: ['./full-game.component.scss']
})
export class FullGameComponent implements OnInit {

  public game?: RootGame;
  public startAction = 0;

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public rootlogService: RootlogService
  ) { }

  async ngOnInit(): Promise<void> {
    this.startAction = +(this.route.snapshot.queryParamMap.get('action') || '0');

    const game = decompressFromEncodedURIComponent(this.route.snapshot.queryParamMap.get('game') || '') || '';
    const gameUrl = this.route.snapshot.queryParamMap.get('gameUrl') || '';

    let gameString = game;

    if (gameUrl) {
      try {
        const stringFromUrl = await this.rootlogService.getGameStringFromURL(gameUrl);
        if (stringFromUrl) {
          gameString = stringFromUrl;
        }
      } catch {
        this.router.navigate(['/input-game']);
        return;
      }
    }

    if (!this.rootlogService.isValidGame(gameString)) {
      this.router.navigate(['/input-game']);
      return;
    }

    this.game = this.rootlogService.game(gameString);

    this.cdRef.detectChanges();
  }

  actionChange(num: number): void {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { action: num },
        queryParamsHandling: 'merge'
      });
  }

}
