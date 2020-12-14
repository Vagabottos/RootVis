import { Injectable } from '@angular/core';

import {
  RootAction, RootFaction, parseRootlog, RootGame, RootMap, RootSuit,
  RootActionGainVP, RootActionCombat, RootActionCraft, RootActionMove, RootActionReveal,
  RootActionClearPath, RootActionSetOutcast, RootActionSetPrices, RootActionUpdateFunds,
  RootActionTriggerPlot, RootActionSwapPlots, RootPieceType, RootPiece
} from '@seiyria/rootlog-parser';

import { isNumber } from 'lodash';

function clone(data: any): any {
  return JSON.parse(JSON.stringify(data));
}

export interface RootClearing {
  warriors: Partial<Record<RootFaction, number>>;
  buildings: any[];
  tokens: any[];
}

export interface RootGameState {
  factionVP: Partial<Record<RootFaction, number>>;
  clearings: RootClearing[];
}

export interface FormattedAction {
  changeTurn?: RootFaction;
  combat?: { attacker: RootFaction, defender: RootFaction };
  gainVP?: { faction: RootFaction, vp: number };
  moves?: Array<{
    num: number,
    faction: RootFaction,
    piece: string,
    pieceType: RootPieceType,
    start?: number|string,
    destination?: number|string
  }>;

  currentState?: RootGameState;

  currentTurn: RootFaction;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RootlogService {

  public readonly clearingPositions: Record<RootMap, Array<[number, number]>> = {
    [RootMap.Fall]: [
      [18, 18],
      [358, 89],
      [362, 367],
      [16, 320],
      [233, 23],
      [370, 206],
      [248, 320],
      [140, 364],
      [19, 134],
      [157, 87],
      [264, 192],
      [124, 227]
    ],
    [RootMap.Winter]: [
      [18, 10],
      [364, 7],
      [364, 337],
      [22, 302],
      [137, 18],
      [243, 38],
      [368, 181],
      [251, 294],
      [145, 341],
      [12, 159],
      [147, 164],
      [264, 170]
    ],
    [RootMap.Lake]: [
      [353, 319],
      [24, 10],
      [25, 307],
      [366, 7],
      [370, 181],
      [267, 39],
      [163, 19],
      [16, 161],
      [230, 342],
      [135, 136],
      [267, 171],
      [152, 260]
    ],
    [RootMap.Mountain]: [
      [22, 15],
      [362, 16],
      [364, 350],
      [26, 310],
      [227, 26],
      [367, 191],
      [189, 348],
      [16, 165],
      [117, 126],
      [204, 143],
      [253, 232],
      [124, 228]
    ]
  };

  public readonly factionNames: Record<RootFaction, string> = {
    [RootFaction.Corvid]: 'corvid',
    [RootFaction.Cult]: 'cult',
    [RootFaction.Duchy]: 'duchy',
    [RootFaction.Eyrie]: 'eyrie',
    [RootFaction.Marquise]: 'marquise',
    [RootFaction.Riverfolk]: 'riverfolk',
    [RootFaction.Vagabond]: 'vagabond',
    [RootFaction.Vagabond2]: 'vagabond',
    [RootFaction.Woodland]: 'woodland',
  };

  public readonly factionProperNames: Record<RootFaction, string> = {
    [RootFaction.Corvid]: 'Corvid',
    [RootFaction.Cult]: 'Cult',
    [RootFaction.Duchy]: 'Duchy',
    [RootFaction.Eyrie]: 'Eyrie',
    [RootFaction.Marquise]: 'Marquise',
    [RootFaction.Riverfolk]: 'Riverfolk',
    [RootFaction.Vagabond]: 'Vagabond',
    [RootFaction.Vagabond2]: 'Vagabond #2',
    [RootFaction.Woodland]: 'Woodland',
  };

  public readonly suitNames: Record<RootSuit, string> = {
    [RootSuit.Bird]: 'bird',
    [RootSuit.Fox]: 'fox',
    [RootSuit.Mouse]: 'mouse',
    [RootSuit.Rabbit]: 'rabbit',
  };

  constructor() { }

  public isValidGame(gameString: string): boolean {
    if (!gameString) { return false; }

    try {
      const { turns } = this.game(gameString);
      return turns?.length > 0;

    } catch {
      return false;

    }
  }

  public game(game: string): RootGame {
    return parseRootlog(game);
  }

  public getAllActions(game: RootGame): FormattedAction[] {
    const allActions = game.turns.map(turn => {

      const actions = turn.actions.map(act => this.formatAction(act, turn.taker));
      actions[0].changeTurn = turn.taker;

      return actions;

    }).flat();

    allActions.forEach((act, i) => {
      if (i === 0) {
        act.currentState = this.createGameState(game);
        this.formatStateForAction(act, act.currentState);
        return;
      }

      const newState = clone(allActions[i - 1].currentState);
      this.formatStateForAction(act, newState);

      act.currentState = newState;
    });

    return allActions;
  }

  private createGameState(game: RootGame): RootGameState {
    const state: RootGameState = {
      factionVP: {},

      // 0 = burrow, 1-12 are clearings
      clearings: Array(13).fill(null).map(() => ({
        warriors: {},
        buildings: [],
        tokens: []
      }))
    };

    Object.keys(game.players).forEach(p => {
      state.factionVP[p as RootFaction] = 0;

      state.clearings.forEach(clearing => {
        clearing.warriors[p as RootFaction] = 0;
      });
    });

    return state;
  }

  private formatStateForAction(act: FormattedAction, curState: RootGameState): void {
    if (act.gainVP) {
      const { faction, vp } = act.gainVP;
      curState.factionVP[faction] = Math.max(0, (curState.factionVP[faction] ?? 0) + vp);
    }

    if (act.moves) {
      act.moves.forEach(move => {
        const { num, faction, pieceType, piece, start, destination } = move;

        const formattedPiece = `${faction.toLowerCase()}_${piece}`;

        switch (pieceType) {
          case RootPieceType.Building: {
            if (isNumber(start)) {
              const idx = curState.clearings[start].buildings.findIndex(x => x === formattedPiece);
              curState.clearings[start].buildings.splice(idx, 1);
            }

            if (isNumber(destination)) {
              for (let i = 0; i < num; i++) {
                curState.clearings[destination].buildings.push(formattedPiece);
              }
            }
            break;
          }

          case RootPieceType.Token: {
            if (isNumber(start)) {
              const idx = curState.clearings[start].tokens.findIndex(x => x === formattedPiece);
              curState.clearings[start].tokens.splice(idx, 1);
            }

            if (isNumber(destination)) {
              for (let i = 0; i < num; i++) {
                curState.clearings[destination].tokens.push(formattedPiece);
              }
            }
            break;
          }

          case RootPieceType.Pawn:
          case RootPieceType.Warrior: {
            if (isNumber(start)) {
              const newWar = ((curState.clearings[start].warriors[faction] ?? 0) - num);
              curState.clearings[start].warriors[faction] = newWar;
            }

            if (isNumber(destination)) {
              const newWar = ((curState.clearings[destination].warriors[faction] ?? 0) + num);
              curState.clearings[destination].warriors[faction] = newWar;
            }
            break;
          }
        }
      });
    }
  }

  private formatAction(act: RootAction, currentTurn: RootFaction): FormattedAction {

    const base: FormattedAction = {
      description: '[[action needs description]]',
      currentTurn,
    };

    if ((act as RootActionGainVP).vp) {
      const vpAct: RootActionGainVP = act as RootActionGainVP;
      base.gainVP = { vp: vpAct.vp, faction: vpAct.faction };
      base.description = `${this.factionProperNames[vpAct.faction]} gains ${vpAct.vp} VP`;
    }

    if ((act as RootActionCombat).attacker) {
      const combatAct: RootActionCombat = act as RootActionCombat;
      base.description = `${this.factionProperNames[combatAct.attacker]} attacks ${this.factionProperNames[combatAct.defender]}`;
    }

    if ((act as RootActionCraft).craftCard || (act as RootActionCraft).craftItem) {
      const craftAct: RootActionCraft = act as RootActionCraft;
      base.description = `Crafts ${craftAct.craftItem || craftAct.craftCard}`;
    }

    if ((act as RootActionMove).things) {
      const moveAct: RootActionMove = act as RootActionMove;
      base.description = `Moves ${JSON.stringify(moveAct.things)}`;
      const moves: any[] = [];

      moveAct.things.forEach((thing) => {
        const destination = thing.destination;

        const piece = thing.thing as RootPiece;
        if (!piece.faction || !piece.pieceType) { return; }
        if (piece.pieceType === RootPieceType.Raft) { return; }

        if (thing.start && !isNumber(thing.start)) { return; }
        if (destination && !isNumber(destination)) { return; }

        moves.push({
          start: thing.start,
          destination,
          num: thing.number,
          faction: piece.faction,
          piece: piece.piece,
          pieceType: piece.pieceType
        });
      });

      base.moves = moves;
    }

    if ((act as RootActionReveal).subjects) {
      const revealAct: RootActionReveal = act as RootActionReveal;
      base.description = `Reveals ${JSON.stringify(revealAct)}`;
    }

    if ((act as RootActionClearPath).clearings) {
      const clearAct: RootActionClearPath = act as RootActionClearPath;
      base.description = `Clears ${JSON.stringify(clearAct)}`;
    }

    if ((act as RootActionSetOutcast).degree) {
      const outcastAct: RootActionSetOutcast = act as RootActionSetOutcast;
      base.description = `Sets outcast to ${this.suitNames[outcastAct.suit]}`;
    }

    if ((act as RootActionSetPrices).price) {
      const setPricesAct: RootActionSetPrices = act as RootActionSetPrices;
      base.description = `Sets prices ${JSON.stringify(setPricesAct)}`;
    }

    if ((act as RootActionUpdateFunds).funds) {
      const updateFundsAct: RootActionUpdateFunds = act as RootActionUpdateFunds;
      base.description = `Updates funds ${JSON.stringify(updateFundsAct)}`;
    }

    if ((act as RootActionTriggerPlot).plot) {
      const plotAct: RootActionTriggerPlot = act as RootActionTriggerPlot;
      base.description = `Triggers plot ${JSON.stringify(plotAct)}`;
    }

    if ((act as RootActionSwapPlots).clearings) {
      const swapAct: RootActionSwapPlots = act as RootActionSwapPlots;
      base.description = `Swaps plots ${JSON.stringify(swapAct)}`;
    }

    return base;
  }

}
