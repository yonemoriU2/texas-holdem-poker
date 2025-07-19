import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameBoard from '../GameBoard';
import { GameContext } from '../../../context/GameContext';
import type { GameState } from '../../../types';

// モックコンポーネント
vi.mock('../../../components/Player/PlayerArea', () => ({
  default: ({ player, isActive, showCards }: any) => (
    <div data-testid={`player-area-${player.id}`}>
      <div>{player.name}</div>
      <div>{isActive ? 'Active' : 'Inactive'}</div>
      <div>{showCards ? 'Cards Visible' : 'Cards Hidden'}</div>
    </div>
  )
}));

vi.mock('../../../components/Community/CommunityArea', () => ({
  default: ({ communityCards, gamePhase, pot }: any) => (
    <div data-testid="community-area">
      <div>Phase: {gamePhase}</div>
      <div>Pot: ${pot}</div>
      <div>Cards: {communityCards.length}</div>
    </div>
  )
}));

vi.mock('../../../components/BettingActions/BettingActions', () => ({
  default: ({ className }: any) => (
    <div data-testid="betting-actions" className={className}>
      Betting Actions
    </div>
  )
}));

vi.mock('../PhaseIndicator', () => ({
  default: () => <div data-testid="phase-indicator">Phase Indicator</div>
}));

vi.mock('../TurnIndicator', () => ({
  default: () => <div data-testid="turn-indicator">Turn Indicator</div>
}));

vi.mock('../PhaseTransition', () => ({
  default: ({ onComplete }: any) => (
    <div data-testid="phase-transition" onClick={onComplete}>
      Phase Transition
    </div>
  )
}));

vi.mock('../BlindManager', () => ({
  default: () => <div data-testid="blind-manager">Blind Manager</div>
}));

vi.mock('../ShowdownDisplay', () => ({
  default: ({ onContinue }: any) => (
    <div data-testid="showdown-display" onClick={onContinue}>
      Showdown Display
    </div>
  )
}));

vi.mock('../GameContinuation', () => ({
  default: ({ onNewHand, onNewGame }: any) => (
    <div data-testid="game-continuation">
      <button onClick={onNewHand}>New Hand</button>
      <button onClick={onNewGame}>New Game</button>
    </div>
  )
}));

vi.mock('../../UI/ErrorDisplay', () => ({
  default: ({ error, onDismiss }: any) => (
    <div data-testid="error-display" onClick={onDismiss}>
      Error: {error.message}
    </div>
  )
}));

vi.mock('../../UI', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  ChipPileAnimation: ({ onComplete }: any) => (
    <div data-testid="chip-animation" onClick={onComplete}>
      Chip Animation
    </div>
  )
}));

const mockGameState: GameState = {
  players: [
    {
      id: 'player',
      name: 'Player',
      chips: 1000,
      holeCards: [],
      currentBet: 0,
      hasActed: false,
      hasFolded: false,
      isAllIn: false,
      isDealer: false
    },
    {
      id: 'cpu',
      name: 'CPU',
      chips: 1000,
      holeCards: [],
      currentBet: 0,
      hasActed: false,
      hasFolded: false,
      isAllIn: false,
      isDealer: true
    }
  ],
  communityCards: [],
  pot: 100,
  currentBet: 20,
  gamePhase: 'preflop',
  activePlayerIndex: 0,
  dealerIndex: 1,
  deck: [],
  winner: null,
  winningHand: null,
  isGameActive: true,
  smallBlind: 10,
  bigBlind: 20,
  bbAnte: 0,
  handNumber: 1,
  blindLevel: 1,
  handsUntilBlindIncrease: 10,
  isGameOver: false,
  gameOverReason: null,
  canStartNewHand: true,
  canStartNewGame: true
};

const mockActions = {
  startGame: vi.fn(),
  dealCards: vi.fn(),
  playerAction: vi.fn(),
  nextPhase: vi.fn(),
  evaluateHands: vi.fn(),
  determineWinner: vi.fn(),
  distributePot: vi.fn(),
  newHand: vi.fn(),
  resetGame: vi.fn(),
  setActivePlayer: vi.fn(),
  increaseBlinds: vi.fn(),
  setBlindLevel: vi.fn(),
  checkGameOver: vi.fn(),
  startNewGame: vi.fn(),
  validateState: vi.fn(),
  repairState: vi.fn(),
  dismissError: vi.fn(),
  clearAllErrors: vi.fn()
};

const mockContextValue = {
  state: mockGameState,
  dispatch: vi.fn(),
  actions: mockActions,
  errors: []
};

describe('GameBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGameBoard = (contextValue = mockContextValue) => {
    return render(
      <GameContext.Provider value={contextValue}>
        <GameBoard />
      </GameContext.Provider>
    );
  };

  it('ゲームボードが正しく表示される', () => {
    renderGameBoard();
    
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
    expect(screen.getByTestId('player-area-player')).toBeInTheDocument();
    expect(screen.getByTestId('player-area-cpu')).toBeInTheDocument();
    expect(screen.getByTestId('community-area')).toBeInTheDocument();
  });

  it('プレイヤーの基本情報が表示される', () => {
    renderGameBoard();
    
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();
  });

  it('ゲーム情報が正しく表示される', () => {
    renderGameBoard();
    
    expect(screen.getByText('Phase: preflop')).toBeInTheDocument();
    expect(screen.getByText('Pot: $100')).toBeInTheDocument();
    expect(screen.getByTestId('player-chips')).toHaveTextContent('プレイヤー: $1,000');
    expect(screen.getByTestId('cpu-chips')).toHaveTextContent('CPU: $1,000');
    expect(screen.getByTestId('blind-info')).toHaveTextContent('ブラインド: $10/$20');
  });

  it('プレイヤーのターンでベッティングアクションが表示される', () => {
    const activePlayerState = {
      ...mockGameState,
      activePlayerIndex: 0
    };
    
    renderGameBoard({
      ...mockContextValue,
      state: activePlayerState
    });
    
    expect(screen.getByTestId('betting-actions')).toBeInTheDocument();
  });

  it('CPUのターンで思考中メッセージが表示される', () => {
    const cpuTurnState = {
      ...mockGameState,
      activePlayerIndex: 1
    };
    
    renderGameBoard({
      ...mockContextValue,
      state: cpuTurnState
    });
    
    expect(screen.getByText('CPUの思考中...')).toBeInTheDocument();
  });

  it('ショーダウンフェーズで適切な表示がされる', () => {
    const showdownState = {
      ...mockGameState,
      gamePhase: 'showdown' as const,
      winner: 'player'
    };
    
    renderGameBoard({
      ...mockContextValue,
      state: showdownState
    });
    
    expect(screen.getByText('ショーダウン中...')).toBeInTheDocument();
  });

  it('ゲーム終了時に適切な表示がされる', () => {
    const endedState = {
      ...mockGameState,
      gamePhase: 'ended' as const,
      isGameOver: true
    };
    
    renderGameBoard({
      ...mockContextValue,
      state: endedState
    });
    
    expect(screen.getByText('ゲーム終了')).toBeInTheDocument();
    expect(screen.getByTestId('game-continuation')).toBeInTheDocument();
  });

  it('エラーが発生した場合にエラー表示される', () => {
    const errorContextValue = {
      ...mockContextValue,
      errors: [
        {
          type: 'GAME_STATE_ERROR' as const,
          message: 'Test error',
          timestamp: Date.now(),
          severity: 'error' as const
        }
      ]
    };
    
    renderGameBoard(errorContextValue);
    
    expect(screen.getByTestId('error-display')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('ハンド番号が正しく表示される', () => {
    renderGameBoard();
    
    expect(screen.getByText('ハンド #1')).toBeInTheDocument();
  });

  it('フェーズ名が正しく表示される', () => {
    renderGameBoard();
    
    expect(screen.getByText('プリフロップ')).toBeInTheDocument();
  });

  it('アクティブプレイヤー情報が表示される', () => {
    renderGameBoard();
    
    expect(screen.getByText('Playerのターン')).toBeInTheDocument();
  });
});