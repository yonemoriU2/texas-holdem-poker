import type { Card, HandRank } from './card';

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  hasActed: boolean;
  hasFolded: boolean;
  isAllIn: boolean;
  isDealer: boolean;
  bestHand?: HandRank;
}

export type PlayerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface ActionOption {
  type: PlayerAction;
  label: string;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  enabled: boolean;
}