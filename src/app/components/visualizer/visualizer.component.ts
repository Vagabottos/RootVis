import { KeyValue } from '@angular/common';
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

  isActiveTurn(faction: RootFaction|string): boolean {
    return this.action.currentTurn === faction;
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
    return Object.keys(clearing.warriors).some(w => (clearing.warriors[w as RootFaction] || 0) > 0);
  }

  clearingHasBuildings(clearing: RootClearing): boolean {
    return Object.keys(clearing.buildings).some(b => (clearing.buildings[b] || 0) > 0);
  }

  clearingHasTokens(clearing: RootClearing): boolean {
    return Object.keys(clearing.tokens).some(t => (clearing.tokens[t] || 0) > 0);
  }

  getBuildings(clearing: RootClearing): string[] {
    const buildings: string[] = [];
    const uniqueBuildings = Object.keys(clearing.buildings);
    uniqueBuildings.forEach(building => {
      for (let i = 0; i < (clearing.buildings[building] || 0); i += 1) {
        buildings.push(building);
      }
    });
    return buildings;
  }

  getTokens(clearing: RootClearing): string[] {
    const tokens: string[] = [];
    const uniqueTokens = Object.keys(clearing.tokens);
    uniqueTokens.forEach(token => {
      for (let i = 0; i < (clearing.tokens[token] || 0); i += 1) {
        tokens.push(token);
      }
    });
    return tokens;
  }

  getPlayers(game: RootGame): KeyValue<RootFaction, string>[] {
    const numPlayers = Object.values(game.players).length;
    const firstRound = game.turns.slice(numPlayers, numPlayers * 2).map(turn => turn.taker as string);

    const sortedPlayers = Object.keys(game.players).sort((player1, player2) => {
      const indexOfPlayer1 = firstRound.indexOf(player1);
      const indexOfPlayer2 = firstRound.indexOf(player2);
      return indexOfPlayer1 - indexOfPlayer2;
    }).map(player => {
      const faction = player as RootFaction;
      return {
        key: faction,
        value: game.players[faction] || ''
      };
    });

    return sortedPlayers;
  }

  clearingHasErrors(clearingIndex: number, state: RootGameState): boolean {
    const clearing = state.clearings[clearingIndex];
    if (!clearing) {
      return false;
    }
    // Error on...

    // Negative number of pieces.
    if (Object.values(clearing.warriors).some(numWarriors => (numWarriors || 0) < 0) ||
        Object.values(clearing.buildings).some(numBuildings => (numBuildings || 0) < 0) ||
        Object.values(clearing.tokens).some(numTokens => (numTokens || 0) < 0)) {
      return true;
    }

    // More than 3 buildings.
    const totalBuildings = Object.values(clearing.buildings).reduce((a, b) => {
      return (a || 0) + (b || 0);
    }, 0) || 0;
    if (totalBuildings > 3) {
      return true;
    }

    // More than one sympathy token.
    if ((clearing.tokens.a_t || 0) > 1) {
      return true;
    }

    // More than one trade post.
    if ((clearing.tokens.o_t_f || 0) +
        (clearing.tokens.o_t_r || 0) +
        (clearing.tokens.o_t_m || 0) > 1) {
      return true;
    }

    // More than one plot token.
    if ((clearing.tokens.p_t || 0) +
        (clearing.tokens.p_t_e || 0) +
        (clearing.tokens.p_t_r || 0) +
        (clearing.tokens.p_t_s || 0) +
        (clearing.tokens.p_t_b || 0) > 1) {
      return true;
    }

    // More than one Eyrie roost.
    if ((clearing.buildings.e_b || 0) > 1) {
      return true;
    }

    // More than one alliance base building.
    if ((clearing.buildings.a_b_f || 0) +
        (clearing.buildings.a_b_r || 0) +
        (clearing.buildings.a_b_m || 0) > 1) {
      return true;
    }

    // TODO: Error when trade post, garden, or base doesn't match the suit.

    return false;
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
