import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BettingActions from '../BettingActions';

// Mock the UI components
vi.mock('../../UI', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  Slider: ({ value, onChange }: any) => (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      data-testid="slider"
    />
  ),
  Modal: ({ isOpen, children }: any) => 
    isOpen ? <div data-testid="modal">{children}</div> : null
}));

// Mock the GameContext
vi.mock('../../../context/GameContext', () => ({
  GameContext: React.createContext({
    state: {
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
      pot: 0,
      currentBet: 0,
      gamePhase: 'preflop',
      activePlayerIndex: 0,
      dealerIndex: 1,
      deck: [],
      winner: null,
      winningHand: null,
      isGameActive: true,
      smallBlind: 10,
      bigBlind: 20,
      handNumber: 1
    },
    dispatch: vi.fn(),
    actions: {
      startGame: vi.fn(),
      dealCards: vi.fn(),
      playerAction: vi.fn(),
      nextPhase: vi.fn(),
      evaluateHands: vi.fn(),
      determineWinner: vi.fn(),
      distributePot: vi.fn(),
      newHand: vi.fn(),
      resetGame: vi.fn(),
      setActivePlayer: vi.fn()
    }
  })
}));

describe('BettingActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('プレイヤーのターンでアクションボタンを表示', () => {
    render(<BettingActions />);
    
    expect(screen.getByText('アクションを選択')).toBeInTheDocument();
    expect(screen.getByText('フォールド')).toBeInTheDocument();
    expect(screen.getByText('チェック')).toBeInTheDocument();
    expect(screen.getByText('ベット')).toBeInTheDocument();
    expect(screen.getByText('オールイン $1000')).toBeInTheDocument();
  });

  it('ベットボタンをクリックするとスライダーが表示される', () => {
    render(<BettingActions />);
    
    const betButton = screen.getByText('ベット');
    fireEvent.click(betButton);
    
    expect(screen.getByText('ベット額を設定')).toBeInTheDocument();
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it('プリセットボタンが正しく表示される', () => {
    render(<BettingActions />);
    
    const betButton = screen.getByText('ベット');
    fireEvent.click(betButton);
    
    expect(screen.getByText('1/4 ポット')).toBeInTheDocument();
    expect(screen.getByText('1/2 ポット')).toBeInTheDocument();
    expect(screen.getByText('ポット')).toBeInTheDocument();
  });
}); 