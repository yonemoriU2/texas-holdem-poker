import type { Card, HandRank } from "./card";
import type { Player, PlayerAction } from "./player";

export type GamePhase =
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "showdown"
  | "ended";

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  gamePhase: GamePhase;
  activePlayerIndex: number;
  dealerIndex: number;
  deck: Card[];
  winner: string | null;
  winningHand: HandRank | null;
  isGameActive: boolean;
  smallBlind: number;
  bigBlind: number;
  bbAnte: number;
  handNumber: number;
  blindLevel: number;
  handsUntilBlindIncrease: number;
  // ゲーム継続機能の追加
  isGameOver: boolean;
  gameOverReason: string | null;
  canStartNewHand: boolean;
  canStartNewGame: boolean;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "DEAL_CARDS" }
  | {
      type: "PLAYER_ACTION";
      payload: { playerId: string; action: PlayerAction; amount?: number };
    }
  | { type: "NEXT_PHASE" }
  | { type: "EVALUATE_HANDS" }
  | { type: "DETERMINE_WINNER" }
  | { type: "DISTRIBUTE_POT" }
  | { type: "NEW_HAND" }
  | { type: "RESET_GAME" }
  | { type: "SET_ACTIVE_PLAYER"; payload: { playerIndex: number } }
  | { type: "INCREASE_BLINDS" }
  | { type: "SET_BLIND_LEVEL"; payload: { level: number } }
  | { type: "CHECK_GAME_OVER" }
  | { type: "START_NEW_GAME" }
  | { type: "REPAIR_STATE"; payload: { repairedState: GameState } };

export interface GameConfig {
  initialChips: number;
  smallBlind: number;
  bigBlind: number;
  bbAnte: number;
  playerName: string;
  cpuName: string;
  blindIncreaseInterval: number;
  blindIncreaseMultiplier: number;
}
