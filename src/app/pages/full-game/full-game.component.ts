import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RootFaction, RootGame, RootMap, RootSuit } from '@seiyria/rootlog-parser';
import { RootlogService, FormattedAction } from '../../rootlog.service';

@Component({
  selector: 'app-full-game',
  templateUrl: './full-game.component.html',
  styleUrls: ['./full-game.component.scss']
})
export class FullGameComponent implements OnInit {

  public game?: RootGame;

  public map!: RootMap;
  public currentAction = 0;
  public allActions: FormattedAction[] = [];

  public get action(): FormattedAction {
    return this.allActions[this.currentAction];
  }

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
    this.allActions = this.rootlogService.getAllActions(this.game);

    console.log(this.game, this.allActions);
  }

  getFaction(key: string): string {
    return this.rootlogService.factionNames[key as RootFaction];
  }

  getSuit(key: string): string {
    return this.rootlogService.suitNames[key as RootSuit];
  }

  setAction(act: number): void {
    this.currentAction = act;
  }

  prevTurn(): void {
    let changed = false;

    for (let i = this.currentAction - 1; i >= 0; i--) {
      const checkAct = this.allActions[i];

      if (checkAct.changeTurn) {
        this.setAction(i);
        changed = true;
        break;
      }
    }

    if (!changed) { this.setAction(0); }
  }

  nextTurn(): void {
    let changed = false;

    for (let i = this.currentAction + 1; i < this.allActions.length; i++) {
      const checkAct = this.allActions[i];

      if (checkAct.changeTurn) {
        this.setAction(i);
        changed = true;
        break;
      }
    }

    if (!changed) { this.setAction(this.allActions.length - 1); }
  }

  getCurrentVP(factionKey: string): number {
    return this.action.currentState?.factionVP[factionKey as RootFaction] ?? 0;
  }

}
