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
    '1_10_2_5':       [130, 65],
    '1_10_12_9':      [110, 155],
    '10_11_12_2_6':   [260, 155],
    '11_12_3_7':      [240, 275],
    '11_3_6':         [360, 295],
    '12_4_9':         [60,  245],
    '12_4_7_8':       [130, 325],
  },
  [RootMap.Winter]: {
    '1_11_12_2_5_6':  [210, 130],
    '1_10_11':        [80,  130],
    '12_2_7':         [360, 145],
    '12_3_7':         [360, 295],
    '12_3_8':         [310, 270],
    '10_11_4':        [90,  230],
    '11_4_9':         [130, 300],
    '11_12_8_9':      [220, 270],
  },
  [RootMap.Mountain]: {
    '1_5_9':          [150, 75],
    '1_8_9':          [75,  125],
    '11_2_5':         [320, 125],
    '11_2_6':         [370, 165],
    '11_12_3_7':      [280, 300],
    '11_3_6':         [370, 300],
    '12_4_8_9':       [90,  250],
    '12_4_7':         [140, 330],
    '10_5_9':         [220, 120],
    '10_11_5':        [265, 120],
    '10_12_9':        [185, 200],
    '10_11_12':       [225, 240],
  },
  [RootMap.Lake]: {
    '1_12_9':         [270, 320],
    '1_11_5':         [350, 260],
    '10_2_7':         [130, 80],
    '10_2_8':         [90,  120],
    '10_12_3_8':      [110, 240],
    '12_3_9':         [150, 340],
    '11_4_5_6':       [350, 140],
    '11_6_7':         [250, 110],
    '10_11_7':        [200, 125],
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
