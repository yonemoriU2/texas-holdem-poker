import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayerArea from '../PlayerArea';
import type { Player } from '../../../types';

const mockPlayer: Player = {
  id: 'test-player',
  name: 'Test Player',
  chips: 1000,
  holeCards: [
    { rank: 'A', suit: 'hearts', id: 'A-hearts' },
    { rank: 'K', suit: 'spades', id: 'K-spades' }
  ],
  currentBet: 50,
  hasActed: false,
  hasFolded: false,
  isAllIn: false,
  isDealer: true
};

describe('PlayerArea', () => {
  it('プレイヤーの基本情報が表示される', () => {
    render(<PlayerArea player={mockPlayer} />);
    
    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument(); // Dealer button
  });

  it('アクティブ状態が正しく表示される', () => {
    render(<PlayerArea player={mockPlayer} isActive={true} />);
    
    expect(screen.getByText('▶ あなたのターン')).toBeInTheDocument();
  });

  it('フォールドしたプレイヤーの状態が表示される', () => {
    const foldedPlayer = { ...mockPlayer, hasFolded: true };
    render(<PlayerArea player={foldedPlayer} />);
    
    expect(screen.getByText('フォールド')).toBeInTheDocument();
  });

  it('オールインしたプレイヤーの状態が表示される', () => {
    const allInPlayer = { ...mockPlayer, isAllIn: true };
    render(<PlayerArea player={allInPlayer} />);
    
    expect(screen.getByText('オールイン')).toBeInTheDocument();
  });

  it('カードが表示される', () => {
    render(<PlayerArea player={mockPlayer} showCards={true} />);
    
    // カードが表示されているかチェック（実際のカードの内容は Card コンポーネントのテストで確認）
    const cards = screen.getAllByTestId(/card/);
    expect(cards).toHaveLength(2);
  });

  it('カードが非表示の場合、裏面が表示される', () => {
    render(<PlayerArea player={mockPlayer} showCards={false} />);
    
    // 裏面カードが表示されているかチェック
    const backCards = screen.getAllByTestId(/card-back/);
    expect(backCards).toHaveLength(2);
  });
});