import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  RootAction, RootActionType, RootFaction, parseRootlog, RootGame, RootMap, RootSuit,
  RootActionGainVP, RootActionCombat, RootActionCraft, RootActionMove, RootActionReveal,
  RootActionClearPath, RootActionSetOutcast, RootActionSetPrices, RootActionUpdateFunds,
  RootActionPlot, RootActionSwapPlots, RootPieceType, RootPiece, RootItem,
  RootRiverfolkPriceSpecial, RootCorvidSpecial, RootForest, RootFactionBoard, RootCardName,
  RootCard, RootEyrieLeaderSpecial, RootEyrieSpecial, RootVagabondCharacterSpecial, RootItemState
} from '@seiyria/rootlog-parser';

import { isNumber } from 'lodash';
import { Observable } from 'rxjs';
import {
  buildingTokenNames,
  clearingPositions, corvidPlotNames, factionNames, factionProperNames,
  forestPositions,
  FormattedAction, itemNames, cardNames, pieceNames, riverfolkCostNames, RootGameState, suitNames, eyrieLeaderNames, vagabondCharacterNames
} from './rootlog.static';

function clone(data: any): any {
  return JSON.parse(JSON.stringify(data));
}

@Injectable({
  providedIn: 'root'
})
export class RootlogService {

  public readonly allItems = [
    { item: RootItem.Bag,       craftedIf: 0 },
    { item: RootItem.Bag,       craftedIf: 1 },
    { item: RootItem.Boot,      craftedIf: 0 },
    { item: RootItem.Boot,      craftedIf: 1 },
    { item: RootItem.Coin,      craftedIf: 0 },
    { item: RootItem.Coin,      craftedIf: 1 },
    { item: RootItem.Crossbow,  craftedIf: 0 },
    { item: RootItem.Hammer,    craftedIf: 0 },
    { item: RootItem.Sword,     craftedIf: 0 },
    { item: RootItem.Sword,     craftedIf: 1 },
    { item: RootItem.Tea,       craftedIf: 0 },
    { item: RootItem.Tea,       craftedIf: 1 }
  ];

  constructor(private http: HttpClient) { }

  public isValidGame(gameString: string): boolean {
    if (!gameString) { return false; }

    try {
      const { turns, parseErrors } = this.game(gameString);
      return turns?.length > 0 && parseErrors.length === 0;

    } catch {
      return false;

    }
  }

  public getGameStringFromURL(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }

  public async getGameStringFromURLPromise(url: string): Promise<string> {
    return this.getGameStringFromURL(url).toPromise();
  }

  public game(game: string): RootGame {
    return parseRootlog(game);
  }

  public getClearingPositions(map: RootMap): Array<[number, number]> {
    return clearingPositions[map];
  }

  public getForests(map: RootMap): Record<string, [number, number]> {
    return forestPositions[map] || {};
  }

  public getForestPosition(map: RootMap, forestKey: string): [number, number] {
    return forestPositions[map][forestKey] || [0, 0];
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

  public getCardName(rootCard: RootCardName|RootEyrieLeaderSpecial|RootVagabondCharacterSpecial|string|undefined): string {
    if (!rootCard) {
      return '';
    }

    if (Object.values(RootEyrieLeaderSpecial).includes(rootCard as RootEyrieLeaderSpecial)) {
      return eyrieLeaderNames[rootCard as RootEyrieLeaderSpecial];
    }

    if (Object.values(RootVagabondCharacterSpecial).includes(rootCard as RootVagabondCharacterSpecial)) {
      return vagabondCharacterNames[rootCard as RootVagabondCharacterSpecial];
    }

    return cardNames[rootCard as RootCardName];
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
        buildings: {},
        tokens: {}
      })),

      craftedItems: {},

      forests: {}
    };

    Object.keys(this.getForests(game.map)).forEach(forest => {
      state.forests[forest] = { warriors: {}, buildings: {}, tokens: {} };
    });

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

    if (act.craftItem) {
      const crafts = curState.craftedItems[act.craftItem] || 0;
      curState.craftedItems[act.craftItem] = crafts + 1;
    }

    if (act.moves) {
      act.moves.forEach(move => {
        const { num, faction, pieceType, piece, start, destination, destinationForest } = move;

        const formattedPiece = faction ? `${faction.toLowerCase()}_${piece}` : '';

        switch (pieceType) {
          case RootPieceType.Building: {
            if (isNumber(start)) {
              const newNumBuildings = ((curState.clearings[start].buildings[formattedPiece] ?? 0) - num);
              curState.clearings[start].buildings[formattedPiece] = newNumBuildings;
            }

            if (isNumber(destination)) {
              const newNumBuildings = ((curState.clearings[destination].buildings[formattedPiece] ?? 0) + num);
              curState.clearings[destination].buildings[formattedPiece] = newNumBuildings;
            }
            break;
          }

          case RootPieceType.Token: {
            if (isNumber(start) && !isNaN(+start)) {
              const newNumTokens = ((curState.clearings[start].tokens[formattedPiece] ?? 0) - num);
              curState.clearings[start].tokens[formattedPiece] = newNumTokens;
            }

            if (isNumber(destination) && !isNaN(+destination)) {
              const newNumTokens = ((curState.clearings[destination].tokens[formattedPiece] ?? 0) + num);
              curState.clearings[destination].tokens[formattedPiece] = newNumTokens;
            }
            break;
          }

          case RootPieceType.Pawn:
          case RootPieceType.Warrior: {

            // if we have a pawn, clear out all of their previous locations
            if (pieceType === RootPieceType.Pawn) {
              curState.clearings.forEach(clearing => clearing.warriors[faction] = 0);
              Object.values(curState.forests).forEach(forest => forest.warriors[faction] = 0);

            // otherwise, clear X of them out of their previous clearing (if possible)
            } else {
              if (isNumber(start) && !isNaN(+start)) {
                const newNumWarriors = ((curState.clearings[start].warriors[faction] ?? 0) - num);
                curState.clearings[start].warriors[faction] = newNumWarriors;
              }
            }

            if (!destinationForest && isNumber(destination) && !isNaN(destination)) {
              const newNumWarriors = ((curState.clearings[destination].warriors[faction] ?? 0) + num);
              curState.clearings[destination].warriors[faction] = newNumWarriors;
            }

            if (destinationForest) {// && curState.forests[destinationForest]) {
              curState.forests[destinationForest].warriors[faction] = num;
            }

            break;
          }
        }
      });
    }
  }

  private formatAction(act: RootAction, currentTurn: RootFaction): FormattedAction {

    const base: FormattedAction = {
      description: `[[action needs description]] ${(act as any).raw || '[no raw]'}`,
      currentTurn,
    };

    if ((act as RootActionGainVP).vp) {
      const vpAct: RootActionGainVP = act as RootActionGainVP;
      base.gainVP = { vp: vpAct.vp, faction: vpAct.faction };
      base.description = `${this.getFactionProperName(vpAct.faction)} gains ${vpAct.vp} VP.`;
    }

    if ((act as RootActionCombat).attacker) {
      const combatAct: RootActionCombat = act as RootActionCombat;
      base.combat = { attacker: combatAct.attacker, defender: combatAct.defender, clearing: combatAct.clearing };
      base.description = `${this.getFactionProperName(combatAct.attacker)} battles ${this.getFactionProperName(combatAct.defender)} in clearing ${combatAct.clearing}.`;
    }

    if ((act as RootActionCraft).craftCard || (act as RootActionCraft).craftItem) {
      const craftAct: RootActionCraft = act as RootActionCraft;
      if (craftAct.craftCard) {
        base.description = `Craft ${this.getCardName(craftAct.craftCard)}.`;
      }

      if (craftAct.craftItem) {
        base.craftItem = craftAct.craftItem;
        base.description = `Craft ${this.getItemName(craftAct.craftItem)}.`;
      }
    }

    if ((act as RootActionMove).things) {
      base.description = `[[needs move description]] ${(act as any).raw || '[no raw]'}`;

      const moveAct: RootActionMove = act as RootActionMove;
      const moves: any[] = [];
      const strings: string[] = [];

      moveAct.things.forEach((thing) => {
        const piece = thing.thing as RootPiece;
        const card = thing.thing as RootCard;
        const item = thing.thing as RootItem;

        if (piece && piece.faction && piece.pieceType) {

          const isBoardStart = thing.start && (thing.start as RootFactionBoard).faction;
          const isBoardStartString = isBoardStart ? isBoardStart : '';

          const isForestStart = thing.start && (thing.start as RootForest).clearings;
          const isForestStartString = isForestStart ? isForestStart.sort((a, b) => a - b).join('_') : '';

          const isBoardEnd = thing.destination && (thing.destination as RootFactionBoard).faction;
          const isBoardEndString = isBoardEnd ? isBoardEnd : '';

          const isForestEnd = thing.destination && (thing.destination as RootForest).clearings;
          const isForestEndString = isForestEnd ? isForestEnd.sort((a, b) => a - b).join('_') : '';

          if (thing.start && (!isBoardStart && !isForestStart && !isNumber(thing.start) && isNaN(+thing.start))) { return; }
          if (thing.destination && (!isBoardEnd && !isForestEnd && !isNumber(thing.destination) && isNaN(+thing.destination))) { return; }

          let moveTypeString = '';
          if (piece.pieceType === RootPieceType.Warrior) {
            moveTypeString = `${this.getFactionProperName(piece.faction)} warrior${thing.number !== 1 ? 's' : ''}`;
          }

          if (piece.pieceType === RootPieceType.Pawn) {
            moveTypeString = `the ${this.getFactionProperName(piece.faction)}'s pawn`;
          }

          if (piece.pieceType === RootPieceType.Building || piece.pieceType === RootPieceType.Token) {
            moveTypeString = `${this.getFactionProperName(piece.faction)} ${this.getBuildingTokenName(piece.faction, piece.piece)}${thing.number !== 1 ? 's' : ''}`;
          }

          if (piece.pieceType === RootPieceType.Raft) {
            moveTypeString = `the raft`;
          }

          const moveNum = piece.pieceType === RootPieceType.Pawn || piece.pieceType === RootPieceType.Raft
            ? moveTypeString
            : `${thing.number} ${moveTypeString}`;
          let startString = thing.start ? `clearing ${thing.start}` : 'supply';
          if (isForestStart) {
            startString = `forest ${isForestStartString}`;
          }

          if (isBoardStart) {
            startString = `${this.getFactionProperName(isBoardStartString)}'s board`;
          }

          let destString = thing.destination ? `clearing ${thing.destination}` : 'supply';
          if (isForestEnd) {
            destString = `forest ${isForestEndString}`;
          }

          if (isBoardEnd) {
            destString = `${this.getFactionProperName(isBoardEndString)}'s board`;
          }

          let moveString = `from ${startString} to ${destString}`;
          let verb = 'Move';
          if (piece.pieceType === RootPieceType.Pawn) {
            moveString = `to ${destString}`;
          } else if (startString === 'supply') {
            verb = 'Place';
            moveString = `in ${destString}`;
          } else if (destString === 'supply') {
            verb = 'Remove';
            moveString = `from ${startString}`;
          }

          const totalString = `${verb} ${moveNum} ${moveString}.`;

          strings.push(totalString);

          moves.push({
            start: thing.start,
            startForest: isForestStartString,
            destination: thing.destination,
            destinationForest: isForestEndString,
            num: thing.number,
            faction: piece.faction,
            piece: piece.piece,
            pieceType: piece.pieceType
          });
        } else if (item && Object.values(RootItem).includes(item)) {
          const isBoardStart = thing.start && (thing.start as RootFactionBoard).faction;
          const isBoardStartString = isBoardStart ? isBoardStart : '';

          const isBoardEnd = thing.destination && (thing.destination as RootFactionBoard).faction;
          const isBoardEndString = isBoardEnd ? isBoardEnd : '';

          const isFromRuin = isNumber(thing.start);
          const isNewItemState = Object.values(RootItemState).includes(thing.destination as RootItemState);

          if (thing.start && !isBoardStart && !isFromRuin) { return; }
          if (thing.destination && !isBoardEnd && !isNewItemState) { return; }

          const moveNum = `${thing.number} ${this.getItemName(item)}`;

          const startString = isFromRuin
            ? ` from the ruin at clearing ${thing.start}`
            : '';

          const destString = isFromRuin ? '' : '';

          const verb = (() => {
            if (isFromRuin) {
              return 'Takes';
            }
            if (isNewItemState) {
              if (thing.destination === RootItemState.FaceDown) {
                return 'Exhausts';
              }
              if (thing.destination === RootItemState.FaceUp) {
                return 'Refreshes';
              }
            }
            return 'Moves';
          })();

          const totalString = `${verb} ${moveNum}${startString}${destString}.`;

          strings.push(totalString);

          moves.push({
            start: thing.start,
            destination: thing.destination,
            num: thing.number,
            item
          });
        } else if (card) { // IT'S A CARD, THEN.
          const isBoardStart = thing.start && (thing.start as RootFactionBoard).faction;
          const isBoardStartString = isBoardStart ? isBoardStart : '';

          const isBoardEnd = thing.destination && (thing.destination as RootFactionBoard).faction;
          const isBoardEndString = isBoardEnd ? isBoardEnd : '';

          const isHandStart = thing.start && Object.values(RootFaction).includes(thing.start as RootFaction);
          const isHandStartString = isHandStart ? thing.start as RootFaction : '';

          const isHandEnd = thing.destination && Object.values(RootFaction).includes(thing.destination as RootFaction);
          const isHandEndString = isHandEnd ? thing.destination as RootFaction : '';

          if (thing.start && (!isBoardStart && !Object.values(RootFaction).includes(isHandStartString as RootFaction))) { return; }
          if (thing.destination && (!isBoardEnd && !Object.values(RootFaction).includes(isHandEndString as RootFaction))) { return; }

          const cardName: string = card
            ? (card.suit ? this.getSuitName(card.suit) + ' ' : '') + (card.cardName ? this.getCardName(card.cardName) + ' ' : '')
            : '';

          const isEyrieLeader = Object.values(RootEyrieLeaderSpecial).includes(card.cardName as RootEyrieLeaderSpecial);
          const isVagabondCharacter = Object.values(RootVagabondCharacterSpecial).includes(card.cardName as RootVagabondCharacterSpecial);

          const moveNum = (() => {
            if (isEyrieLeader) {
              return 'the ' + cardName;
            }

            if (isVagabondCharacter) {
              return 'the ' + cardName;
            }

            return `${thing.number} ${cardName}card${thing.number === 1 ? '' : 's'}`;
          })();

          let startString = thing.start ? ` from their hand` : '';
          let destString = thing.destination ? ` to the ${this.getFactionProperName(isHandEndString)}'s hand` : '';

          if (isBoardStart) {
            if (isBoardStartString === RootFaction.Woodland) {
              startString = ` from the ${this.getFactionProperName(isBoardStartString)}'s supporters`;
            } else {
              startString = ` from the ${this.getFactionProperName(isBoardStartString)}'s board`;
            }
          } else if (isHandStart) {
            startString = ` from their hand`;
          }

          if (isBoardEnd) {
            if (isBoardEndString === RootFaction.Woodland) {
              destString = ` to the ${this.getFactionProperName(isBoardEndString)}'s supporters`;
            } else if (currentTurn === RootFaction.Eyrie) {
              if (isEyrieLeader) {
                destString = ` as their new leader`;
              } else if (Object.values(RootEyrieSpecial).includes(destString as RootEyrieSpecial)) {
                destString = ` to their Decree as a ${card.cardName}`;
              }
            } else if (currentTurn === RootFaction.Vagabond || currentTurn === RootFaction.Vagabond2) {
              if (isVagabondCharacter) {
                destString = ` as their character`;
              }
            } else {
              destString = ` to the ${this.getFactionProperName(isBoardEndString)}'s board`;
            }
          } else if (isHandEnd) {
            if (isHandEndString === currentTurn) {
              destString = ` to their hand`;
            } else {
              destString = ` to the ${this.getFactionProperName(isHandEndString)}'s hand`;
            }
          }

          const verb = (() => {
            if (isEyrieLeader || isVagabondCharacter) {
              return 'Choose';
            }
            if (!thing.start) {
              return 'Draw';
            }
            if (!thing.destination) {
              return 'Discard';
            }
            if (isHandStart && isHandEnd) {
              return 'Give';
            }
            return 'Add';
          })();

          const totalString = `${verb} ${moveNum}${startString}${destString}.`;

          strings.push(totalString);

          moves.push({
            start: thing.start,
            destination: thing.destination,
            num: thing.number,
            card,
          });

        }
      });

      if (strings.length !== 0) {
        base.description = `${strings.join(' ')}`;
      }

      base.moves = moves;
    }

    if ((act as RootActionReveal).subjects) {
      const revealAct: RootActionReveal = act as RootActionReveal;
      if (revealAct.subjects.length > 0 &&
        !revealAct.subjects.some(subject => !revealAct.subjects.map(s => s.revealer).includes(subject.revealer))) {
        // ALL THE SAME REVEALER.
        const revealingFaction = this.getFactionProperName(revealAct.subjects[0].revealer);
        const cards = revealAct.subjects.map(subject => {
          const cardName: string = subject.card
            ? (subject.card.suit ? this.getSuitName(subject.card.suit) + ' ' : '') + (subject.card.cardName || '') + ' '
            : '';
          return `${subject.number} ${cardName}card${subject.number === 1 ? '' : 's'}`;
        }).join(' and ');
        const target = !revealAct.targets.some(t => t)
          ? 'the whole table'
          : revealAct.targets.map(this.getFactionProperName).join(' and ');
        base.description = `${revealingFaction} reveals ${cards} to ${target}.`;
      } else {
        // MORE THAN ONE REVEALING FACTION IN ONE ACTION. (When would this happen?)
        base.description = `Reveal ${JSON.stringify(revealAct)}.`;
      }
    }

    if ((act as RootActionClearPath).clearings) {
      const clearAct: RootActionClearPath = act as RootActionClearPath;
      base.description = `Clear path between clearings ${clearAct.clearings[0]} and ${clearAct.clearings[1]}.`;
    }

    if ((act as RootActionSetOutcast).isHated === true || (act as RootActionSetOutcast).isHated === false) {
      const outcastAct: RootActionSetOutcast = act as RootActionSetOutcast;
      base.description = `Set ${outcastAct.isHated ? 'hated' : ''} outcast to ${this.getSuitName(outcastAct.suit)}.`;
    }

    if ((act as RootActionSetPrices).price) {
      const setPricesAct: RootActionSetPrices = act as RootActionSetPrices;
      const allPrices = (priceTypes => {
        if (priceTypes.length === 3) {
          return 'all prices';
        }
        return `the price of ${priceTypes.join(' and ')}`;
      })(setPricesAct.priceTypes.map(x => this.getRiverfolkCostName(x)));
      base.description = `Set ${allPrices} to ${setPricesAct.price}.`;
    }

    if ((act as RootActionUpdateFunds).funds) {
      const updateFundsAct: RootActionUpdateFunds = act as RootActionUpdateFunds;
      base.description = `Has ${updateFundsAct.funds} total funds.`;
    }

    if ((act as RootActionPlot).plot) {
      const plotAct: RootActionPlot = act as RootActionPlot;
      if (plotAct.type === RootActionType.FlipPlot) {
        base.description = `Flip ${this.getCorvidPlotName(plotAct.plot)} plot in clearing ${plotAct.clearing}.`;

        base.moves = base.moves || [];
        // REMOVE OLD PLOT
        base.moves.push({
          start: plotAct.clearing,
          num: 1,
          faction: RootFaction.Corvid,
          piece: 't',
          pieceType: RootPieceType.Token
        });
        // ADD NEW PLOT
        base.moves.push({
          destination: plotAct.clearing,
          num: 1,
          faction: RootFaction.Corvid,
          piece: plotAct.plot,
          pieceType: RootPieceType.Token
        });
      }
    }

    if ((act as RootActionSwapPlots).clearings) {
      const swapAct: RootActionSwapPlots = act as RootActionSwapPlots;
      base.description = `Swap plots between clearings ${swapAct.clearings[0]} and ${swapAct.clearings[1]}.`;
    }

    return base;
  }

}
