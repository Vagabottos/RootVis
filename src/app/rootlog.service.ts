import { Injectable } from '@angular/core';

import {
  RootAction, RootFaction, parseRootlog, RootGame, RootMap, RootSuit,
  RootActionGainVP, RootActionCombat, RootActionCraft, RootActionMove, RootActionReveal,
  RootActionClearPath, RootActionSetOutcast, RootActionSetPrices, RootActionUpdateFunds,
  RootActionTriggerPlot, RootActionSwapPlots, RootPieceType, RootPiece, RootItem, RootRiverfolkPriceSpecial, RootCorvidSpecial
} from '@seiyria/rootlog-parser';

import { isNumber } from 'lodash';
import {
  buildingTokenNames,
  clearingPositions, corvidPlotNames, factionNames, factionProperNames,
  FormattedAction, itemNames, pieceNames, riverfolkCostNames, RootGameState, suitNames
} from './rootlog.static';

function clone(data: any): any {
  return JSON.parse(JSON.stringify(data));
}

@Injectable({
  providedIn: 'root'
})
export class RootlogService {

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

  public getClearingPositions(map: RootMap): Array<[number, number]> {
    return clearingPositions[map];
  }

  public getFactionName(faction: RootFaction|string): string {
    return factionNames[faction as RootFaction];
  }

  public getFactionProperName(faction: RootFaction|string): string {
    return factionProperNames[faction as RootFaction];
  }

  public getSuitName(suit: RootSuit|string): string {
    return suitNames[suit as RootSuit];
  }

  public getPieceName(name: RootPieceType|string): string {
    return pieceNames[name as RootPieceType];
  }

  public getItemName(item: RootItem|string): string {
    return itemNames[item as RootItem];
  }

  public getBuildingTokenName(faction: RootFaction, piece: string): string {
    return buildingTokenNames[`${faction}_${piece}`.toLowerCase()];
  }

  public getRiverfolkCostName(cost: RootRiverfolkPriceSpecial|string): string {
    return riverfolkCostNames[cost as RootRiverfolkPriceSpecial];
  }

  public getCorvidPlotName(plot: RootCorvidSpecial|string): string {
    return corvidPlotNames[plot as RootCorvidSpecial];
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
            if (isNumber(start) && !isNaN(+start)) {
              const idx = curState.clearings[start].tokens.findIndex(x => x === formattedPiece);
              curState.clearings[start].tokens.splice(idx, 1);
            }

            if (isNumber(destination) && !isNaN(+destination)) {
              for (let i = 0; i < num; i++) {
                curState.clearings[destination].tokens.push(formattedPiece);
              }
            }
            break;
          }

          case RootPieceType.Pawn:
          case RootPieceType.Warrior: {
            if (isNumber(start) && !isNaN(+start)) {
              const newWar = ((curState.clearings[start].warriors[faction] ?? 0) - num);
              curState.clearings[start].warriors[faction] = newWar;
            }

            if (isNumber(destination) && !isNaN(destination)) {
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
      base.description = `${this.getFactionProperName(vpAct.faction)} gains ${vpAct.vp} VP`;
    }

    if ((act as RootActionCombat).attacker) {
      const combatAct: RootActionCombat = act as RootActionCombat;
      base.description = `${this.getFactionProperName(combatAct.attacker)} attacks ${this.getFactionProperName(combatAct.defender)} in clearing ${combatAct.clearing}`;
    }

    if ((act as RootActionCraft).craftCard || (act as RootActionCraft).craftItem) {
      const craftAct: RootActionCraft = act as RootActionCraft;
      if (craftAct.craftCard) {
        base.description = `Crafts ${craftAct.craftCard}`;
      }

      if (craftAct.craftItem) {
        base.description = `Crafts ${this.getItemName(craftAct.craftItem)}`;
      }
    }

    if ((act as RootActionMove).things) {
      base.description = '[[needs description]]';

      const moveAct: RootActionMove = act as RootActionMove;
      const moves: any[] = [];
      const strings: string[] = [];

      moveAct.things.forEach((thing) => {
        const destination = thing.destination;

        const piece = thing.thing as RootPiece;
        if (!piece || !piece.faction || !piece.pieceType) { return; }
        if (piece.pieceType === RootPieceType.Raft) { return; }

        if (thing.start && !isNumber(thing.start) && !isNaN(+thing.start)) { return; }
        if (destination && !isNumber(destination) && !isNaN(+destination)) { return; }

        let moveTypeString = '';
        if (piece.pieceType === RootPieceType.Warrior) {
          moveTypeString = 'warrior(s)';
        }

        if (piece.pieceType === RootPieceType.Pawn) {
          moveTypeString = 'pawn(s)';
        }

        if (piece.pieceType === RootPieceType.Building || piece.pieceType === RootPieceType.Token) {
          moveTypeString = `${this.getFactionName(piece.faction)} ${this.getBuildingTokenName(piece.faction, piece.piece)}`;
        }

        const moveNum = `${thing.number} ${moveTypeString}`;
        const startString = thing.start ? `clearing ${thing.start}` : 'supply';
        const destString = thing.destination ? `clearing ${thing.destination}` : 'supply';

        const moveString = `from ${startString} to ${destString}`;
        const totalString = `${moveNum} ${moveString}`;

        strings.push(totalString);

        moves.push({
          start: thing.start,
          destination,
          num: thing.number,
          faction: piece.faction,
          piece: piece.piece,
          pieceType: piece.pieceType
        });
      });

      if (strings.length !== 0) {
        base.description = `Moves ${strings.join(', ')}`;
      }

      base.moves = moves;

      // console.log(moveAct, moves, base.description);
    }

    if ((act as RootActionReveal).subjects) {
      const revealAct: RootActionReveal = act as RootActionReveal;
      base.description = `Reveals ${JSON.stringify(revealAct)}`;
    }

    if ((act as RootActionClearPath).clearings) {
      const clearAct: RootActionClearPath = act as RootActionClearPath;
      base.description = `Clears path between clearings ${clearAct.clearings[0]} and ${clearAct.clearings[1]}`;
    }

    if ((act as RootActionSetOutcast).degree) {
      const outcastAct: RootActionSetOutcast = act as RootActionSetOutcast;
      base.description = `Sets outcast to ${this.getSuitName(outcastAct.suit)}`;
    }

    if ((act as RootActionSetPrices).price) {
      const setPricesAct: RootActionSetPrices = act as RootActionSetPrices;
      const allPrices = setPricesAct.priceTypes.map(x => this.getRiverfolkCostName(x)).join(', ');
      base.description = `Sets prices ${allPrices} to ${setPricesAct.price}`;
    }

    if ((act as RootActionUpdateFunds).funds) {
      const updateFundsAct: RootActionUpdateFunds = act as RootActionUpdateFunds;
      base.description = `Updates funds ${JSON.stringify(updateFundsAct)}`;
    }

    if ((act as RootActionTriggerPlot).plot) {
      const plotAct: RootActionTriggerPlot = act as RootActionTriggerPlot;
      base.description = `Triggers plot ${this.getCorvidPlotName(plotAct.plot)} in clearing ${plotAct.clearing}`;
    }

    if ((act as RootActionSwapPlots).clearings) {
      const swapAct: RootActionSwapPlots = act as RootActionSwapPlots;
      base.description = `Swaps plots between clearings ${swapAct.clearings[0]} and ${swapAct.clearings[1]}`;
    }

    return base;
  }

}
