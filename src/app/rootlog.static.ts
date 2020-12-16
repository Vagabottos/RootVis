import { RootCorvidSpecial, RootFaction, RootItem, RootMap, RootPieceType, RootRiverfolkPriceSpecial, RootSuit } from '@seiyria/rootlog-parser';

export interface RootClearing {
  warriors: Partial<Record<RootFaction, number>>;
  buildings: Partial<Record<string, number>>;
  tokens: Partial<Record<string, number>>;
}

export interface RootGameState {
  factionVP: Partial<Record<RootFaction, number>>;
  clearings: RootClearing[];
  craftedItems: Partial<Record<RootItem, number>>;
  forests: Record<string, RootClearing>;
}

export interface FormattedAction {
  changeTurn?: RootFaction;
  combat?: { attacker: RootFaction, defender: RootFaction };
  gainVP?: { faction: RootFaction, vp: number };
  moves?: Array<{
    num: number;
    faction: RootFaction;
    piece: string;
    pieceType: RootPieceType;
    start?: number|string;
    startForest?: string;
    destination?: number|string;
    destinationForest?: string;
  }>;

  craftItem?: RootItem;

  currentState?: RootGameState;

  currentTurn: RootFaction;
  description: string;
}

export const forestPositions: Record<RootMap, Record<string, [number, number]>> = {
  [RootMap.Fall]: {
    '1_2_5_10':       [130, 65],
    '1_9_10_12':      [110, 155],
    '2_6_10_11_12':   [260, 155],
    '3_7_11_12':      [240, 275],
    '3_6_11':         [360, 295],
    '4_9_12':         [60,  245],
    '4_7_8_12':       [130, 325],
  },
  [RootMap.Winter]: {
    '1_2_5_6_11_12':  [210, 130],
    '1_10_11':        [80,  130],
    '2_7_12':         [360, 145],
    '3_7_12':         [360, 295],
    '3_8_12':         [310, 270],
    '4_10_11':        [90,  230],
    '4_9_11':         [130, 300],
    '8_9_11_12':      [220, 270],
  },
  [RootMap.Mountain]: {
    '1_5_9':          [150, 75],
    '1_8_9':          [75,  125],
    '2_5_11':         [320, 125],
    '2_6_11':         [370, 165],
    '3_7_11_12':      [280, 300],
    '3_6_11':         [370, 300],
    '4_8_9_12':       [90,  250],
    '4_7_12':         [140, 330],
    '5_9_10':         [220, 120],
    '5_10_11':        [265, 120],
    '9_10_12':        [185, 200],
    '10_11_12':       [225, 240],
  },
  [RootMap.Lake]: {
    '1_9_12':         [270, 320],
    '1_5_11':         [350, 260],
    '2_7_10':         [130, 80],
    '2_8_10':         [90,  120],
    '3_8_10_12':      [110, 240],
    '3_9_12':         [150, 340],
    '4_5_6_11':       [350, 140],
    '6_7_11':         [250, 110],
    '7_10_11':        [200, 125],
  }
};

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
    [370, 8],
    [370, 343],
    [22, 308],
    [140, 19],
    [247, 40],
    [375, 184],
    [256, 301],
    [150, 347],
    [12, 162],
    [150, 168],
    [269, 175]
  ],
  [RootMap.Lake]: [
    [364, 330],
    [24, 10],
    [27, 318],
    [377, 7],
    [381, 188],
    [275, 39],
    [169, 19],
    [18, 166],
    [238, 353],
    [140, 141],
    [275, 176],
    [158, 269]
  ],
  [RootMap.Mountain]: [
    [22, 15],
    [378, 18],
    [381, 365],
    [27, 324],
    [237, 28],
    [384, 200],
    [197, 363],
    [17, 172],
    [123, 132],
    [213, 148],
    [264, 242],
    [130, 236]
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
  [RootFaction.Vagabond2]: 'vagabond2',
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
