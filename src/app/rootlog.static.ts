import { RootCorvidSpecial, RootDuchySpecial, RootFaction, RootItem, RootLizardSpecial, RootMap, RootMarquiseSpecial, RootPieceType, RootRiverfolkPriceSpecial, RootRiverfolkSpecial, RootSuit, RootWoodlandSpecial } from '@seiyria/rootlog-parser';

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

export const clearingPositions: Record<RootMap, Array<[number, number]>> = {
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

export const factionNames: Record<RootFaction, string> = {
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

export const factionProperNames: Record<RootFaction, string> = {
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

export const suitNames: Record<RootSuit, string> = {
  [RootSuit.Bird]: 'bird',
  [RootSuit.Fox]: 'fox',
  [RootSuit.Mouse]: 'mouse',
  [RootSuit.Rabbit]: 'rabbit',
};

export const pieceNames: Record<RootPieceType, string> = {
  [RootPieceType.Building]: 'building',
  [RootPieceType.Pawn]: 'pawn',
  [RootPieceType.Raft]: 'raft',
  [RootPieceType.Token]: 'token',
  [RootPieceType.Warrior]: 'warrior'
};

export const itemNames: Record<RootItem, string> = {
  [RootItem.Sword]: 'sword',
  [RootItem.Bag]: 'bag',
  [RootItem.Coin]: 'coin',
  [RootItem.Crossbow]: 'crossbow',
  [RootItem.Hammer]: 'hammer',
  [RootItem.Tea]: 'tea',
  [RootItem.Torch]: 'torch',
  [RootItem.Boot]: 'boot',
};

export const riverfolkCostNames: Record<RootRiverfolkPriceSpecial, string> = {
  [RootRiverfolkPriceSpecial.HandCard]: 'hand card',
  [RootRiverfolkPriceSpecial.Mercenaries]: 'mercenaries',
  [RootRiverfolkPriceSpecial.Riverboats]: 'riverboats'
};

export const corvidPlotNames: Record<RootCorvidSpecial, string> = {
  [RootCorvidSpecial.BombPlot]: 'bomb plot',
  [RootCorvidSpecial.ExtortionPlot]: 'extortion',
  [RootCorvidSpecial.RaidPlot]: 'raid',
  [RootCorvidSpecial.SnarePlot]: 'snare',
  [RootCorvidSpecial.Plot]: 'plot'
};

export const buildingTokenNames: Record<string, string> = {
  a_b_f: 'fox base',
  a_b_m: 'mouse base',
  a_b_r: 'rabbit base',
  c_b_r: 'recruiter',
  c_b_s: 'sawmill',
  c_b_w: 'workshop',
  d_b_c: 'citadel',
  d_b_m: 'market',
  e_b: 'roost',
  l_b_f: 'fox garden',
  l_b_m: 'mouse garden',
  l_b_r: 'rabbit gaden',

  a_t: 'sympathy',
  c_t_k: 'keep',
  c_t: 'wood',
  o_t_f: 'fox tradepost',
  o_t_m: 'mouse tradepost',
  o_t_r: 'rabbit tradepost',
  p_d: 'tunnel',
  p_t_b: 'bomb',
  p_t_e: 'extortion',
  p_t_r: 'raid',
  p_t_s: 'snare',
  p_t: 'plot'
};
