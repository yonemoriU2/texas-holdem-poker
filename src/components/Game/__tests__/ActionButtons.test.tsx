import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButtons from '../ActionButtons';
import type { Player, GameState } from '../../../types';

const mockPlayer: Player = {
  id: 'player',
  name: 'Test Player',
  chips: 1000,
  holeCards: [],
  currentBet: 0,
  hasActed: false,
  hasFolded: false,
  isAllIn: false,
  isDealer: false
};

const mockGameState: GameState = {
  players: [mockPlayer],
  communityCards: [],
  pot: 100,
  currentBet: 20,
  gamePhase: 'preflop',
  activePlayerIndex: 0,
  dealerIndex: 0,
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

describe('ActionButtons', () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('アクション可能な場合、基本的なボタンが表示される', () => {
    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByTestId('fold-btn')).toBeInTheDocument();
    expect(screen.getByTestId('call-btn')).toBeInTheDocument();
    expect(screen.getByTestId('raise-btn')).toBeInTheDocument();
    expect(screen.getByTestId('all-in-btn')).toBeInTheDocument();
  });

  it('フォールドボタンをクリックするとアクションが実行される', () => {
    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('fold-btn'));
    expect(mockOnAction).toHaveBeenCalledWith('fold');
  });

  it('コールボタンをクリックするとアクションが実行される', () => {
    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('call-btn'));
    expect(mockOnAction).toHaveBeenCalledWith('call');
  });

  it('オールインボタンをクリックするとアクションが実行される', () => {
    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('all-in-btn'));
    expect(mockOnAction).toHaveBeenCalledWith('all-in');
  });

  it('チェック可能な場合、チェックボタンが表示される', () => {
    const gameStateWithNoCurrentBet = {
      ...mockGameState,
      currentBet: 0
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={gameStateWithNoCurrentBet} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByTestId('check-btn')).toBeInTheDocument();
    expect(screen.getByTestId('bet-btn')).toBeInTheDocument();
  });

  it('チェックボタンをクリックするとアクションが実行される', () => {
    const gameStateWithNoCurrentBet = {
      ...mockGameState,
      currentBet: 0
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={gameStateWithNoCurrentBet} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('check-btn'));
    expect(mockOnAction).toHaveBeenCalledWith('check');
  });

  it('ベットボタンをクリックするとベット入力画面が表示される', () => {
    const gameStateWithNoCurrentBet = {
      ...mockGameState,
      currentBet: 0
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={gameStateWithNoCurrentBet} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('bet-btn'));
    
    expect(screen.getByText('ベット額を選択')).toBeInTheDocument();
    expect(screen.getByTestId('bet-slider')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-bet-btn')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-bet-btn')).toBeInTheDocument();
  });

  it('レイズボタンをクリックするとベット入力画面が表示される', () => {
    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('raise-btn'));
    
    expect(screen.getByText('ベット額を選択')).toBeInTheDocument();
    expect(screen.getByTestId('bet-slider')).toBeInTheDocument();
  });

  it('ベット入力画面でスライダーを操作できる', () => {
    const gameStateWithNoCurrentBet = {
      ...mockGameState,
      currentBet: 0
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={gameStateWithNoCurrentBet} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('bet-btn'));
    
    const slider = screen.getByTestId('bet-slider');
    fireEvent.change(slider, { target: { value: '100' } });
    
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('プリセットボタンが正しく動作する', () => {
    const gameStateWithNoCurrentBet = {
      ...mockGameState,
      currentBet: 0,
      pot: 200
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={gameStateWithNoCurrentBet} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('bet-btn'));
    
    // ポット半分ボタン
    fireEvent.click(screen.getByTestId('half-pot-btn'));
    expect(screen.getByText('$100')).toBeInTheDocument();
    
    // ポットボタン
    fireEvent.click(screen.getByTestId('pot-btn'));
    expect(screen.getByText('$200')).toBeInTheDocument();
    
    // オールインボタン
    fireEvent.click(screen.getByTestId('all-in-btn'));
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('ベット確定ボタンをクリックするとアクションが実行される', () => {
    const gameStateWithNoCurrentBet = {
      ...mockGameState,
      currentBet: 0
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={gameStateWithNoCurrentBet} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('bet-btn'));
    
    const slider = screen.getByTestId('bet-slider');
    fireEvent.change(slider, { target: { value: '100' } });
    
    fireEvent.click(screen.getByTestId('confirm-bet-btn'));
    
    expect(mockOnAction).toHaveBeenCalledWith('bet', 100);
  });

  it('ベットキャンセルボタンをクリックすると入力画面が閉じる', () => {
    const gameStateWithNoCurrentBet = {
      ...mockGameState,
      currentBet: 0
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={gameStateWithNoCurrentBet} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByTestId('bet-btn'));
    expect(screen.getByText('ベット額を選択')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('cancel-bet-btn'));
    expect(screen.queryByText('ベット額を選択')).not.toBeInTheDocument();
  });

  it('プレイヤーがアクション不可能な場合、待機メッセージが表示される', () => {
    const inactivePlayer = {
      ...mockPlayer,
      hasActed: true
    };

    render(
      <ActionButtons 
        player={inactivePlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('アクション待機中...')).toBeInTheDocument();
    expect(screen.queryByTestId('fold-btn')).not.toBeInTheDocument();
  });

  it('フォールドしたプレイヤーには何も表示されない', () => {
    const foldedPlayer = {
      ...mockPlayer,
      hasFolded: true
    };

    render(
      <ActionButtons 
        player={foldedPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('アクション待機中...')).toBeInTheDocument();
  });

  it('オールインしたプレイヤーには何も表示されない', () => {
    const allInPlayer = {
      ...mockPlayer,
      isAllIn: true
    };

    render(
      <ActionButtons 
        player={allInPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('アクション待機中...')).toBeInTheDocument();
  });

  it('ゲームが非アクティブな場合、何も表示されない', () => {
    const inactiveGameState = {
      ...mockGameState,
      isGameActive: false
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={inactiveGameState} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('アクション待機中...')).toBeInTheDocument();
  });

  it('ショーダウンフェーズでは何も表示されない', () => {
    const showdownGameState = {
      ...mockGameState,
      gamePhase: 'showdown' as const
    };

    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={showdownGameState} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('アクション待機中...')).toBeInTheDocument();
  });

  it('アクション情報が正しく表示される', () => {
    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('現在のベット: $20')).toBeInTheDocument();
    expect(screen.getByText('ポット: $100')).toBeInTheDocument();
    expect(screen.getByText('コール額: $20')).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    render(
      <ActionButtons 
        player={mockPlayer} 
        gameState={mockGameState} 
        onAction={mockOnAction}
        className="custom-class"
      />
    );

    const actionButtons = screen.getByTestId('action-buttons');
    expect(actionButtons).toHaveClass('custom-class');
  });
});