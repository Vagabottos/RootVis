import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RootFaction, RootGame, RootMap, RootSuit } from '@seiyria/rootlog-parser';
import { RootlogService } from '../../rootlog.service';
import { FormattedAction, RootGameState } from '../../rootlog.static';

@Component({
  selector: 'app-full-game',
  templateUrl: './full-game.component.html',
  styleUrls: ['./full-game.component.scss']
})
export class FullGameComponent implements OnInit {

  public game?: RootGame;
  public startAction = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public rootlogService: RootlogService
  ) { }

  ngOnInit(): void {
    const game = atob(this.route.snapshot.queryParamMap.get('game') || '');
    if (!this.rootlogService.isValidGame(game)) {
      this.router.navigate(['/input-game']);
      return;
    }

    this.game = this.rootlogService.game(game);
    this.startAction = +(this.route.snapshot.queryParamMap.get('action') || '0');
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
