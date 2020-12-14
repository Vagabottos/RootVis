import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RootFaction, RootGame, RootMap } from '@seiyria/rootlog-parser';
import { interval } from 'rxjs';
import { RootlogService } from '../../rootlog.service';
import { FormattedAction, RootClearing, RootGameState } from '../../rootlog.static';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

  @Input() game!: RootGame;
  @Input() startAction!: number;
  @Input() startClearing!: number;

  @Output() actionChange = new EventEmitter();
  @Output() clearingChange = new EventEmitter();

  public map!: RootMap;
  public currentAction = 0;
  public currentClearing = -1;
  public allActions: FormattedAction[] = [];

  public get action(): FormattedAction {
    return this.allActions[this.currentAction];
  }

  public get state(): RootGameState | undefined {
    return this.action.currentState;
  }

  public get clearing(): RootClearing {
    return this.state?.clearings[this.currentClearing] as RootClearing;
  }

  public autoPlay = false;

  constructor(
    public rootlogService: RootlogService
  ) { }

  ngOnInit(): void {
    this.allActions = this.rootlogService.getAllActions(this.game);

    this.watchKeybinds();
    this.autoplayLoop();

    if (this.startAction) {
      this.setAction(this.startAction);
    }

    if (this.startClearing) {
      this.showClearingInfo(this.startClearing);
    }

    console.log(this.game, this.allActions);
  }

  setAction(act: number): void {
    if (act < 0 || act > this.allActions.length - 1) { return; }
    this.currentAction = act;

    this.actionChange.next(act);
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

  toggleAutoplay(): void {
    this.autoPlay = !this.autoPlay;
  }

  getCurrentVP(factionKey: string): number {
    return this.action.currentState?.factionVP[factionKey as RootFaction] ?? 0;
  }

  showClearingInfo(idx: number): void {
    this.currentClearing = idx;

    this.clearingChange.next(idx);
  }

  clearingHasWarriors(clearing: RootClearing): boolean {
    return Object.keys(clearing.warriors).some(w => clearing.warriors[w as RootFaction] !== 0);
  }

  private watchKeybinds(): void {
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        this.setAction(this.currentAction - 1);
        return false;
      }

      if (e.key === 'ArrowRight') {
        this.setAction(this.currentAction + 1);
        return false;
      }

      return;
    });
  }

  private autoplayLoop(): void {
    interval(500).subscribe(() => {
      if (!this.autoPlay) { return; }

      this.setAction(this.currentAction + 1);
    });
  }

}
