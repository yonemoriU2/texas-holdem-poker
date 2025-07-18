import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CommunityArea from '../CommunityArea';
import type { Card } from '../../../types';

const mockCards: Card[] = [
  { id: '1', suit: 'hearts', rank: 'A' },
  { id: '2', suit: 'diamonds', rank: 'K' },
  { id: '3', suit: 'clubs', rank: 'Q' },
  { id: '4', suit: 'spades', rank: 'J' },
  { id: '5', suit: 'hearts', rank: '10' }
];

describe('CommunityArea', () => {
  it('ポット額が正しく表示される', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="flop" 
        pot={1500}
        currentBet={0}
      />
    );
    
    expect(screen.getByText('ポット')).toBeInTheDocument();
    expect(screen.getByText('$1,500')).toBeInTheDocument();
  });

  it('現在のベット額が表示される', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="flop" 
        pot={1500}
        currentBet={200}
      />
    );
    
    expect(screen.getByText('現在のベット: $200')).toBeInTheDocument();
  });

  it('現在のベットが0の場合はベット情報が表示されない', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="flop" 
        pot={1500}
        currentBet={0}
      />
    );
    
    expect(screen.queryByText(/現在のベット/)).not.toBeInTheDocument();
  });

  it('ゲーム進行状況インジケーターが正しく表示される', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="turn" 
        pot={1500}
        currentBet={0}
      />
    );
    
    // 5つのインジケーターが表示されることを確認
    const indicators = screen.getAllByTitle(/preflop|flop|turn|river|showdown/);
    expect(indicators).toHaveLength(5);
  });

  it('プリフロップフェーズではコミュニティカードが表示されない', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="preflop" 
        pot={1500}
        currentBet={0}
      />
    );
    
    expect(screen.getByTestId('community-area')).toBeInTheDocument();
    expect(screen.getByText('プリフロップ')).toBeInTheDocument();
    
    // カードが表示されていないことを確認
    const cardElements = screen.queryAllByTestId('card');
    expect(cardElements).toHaveLength(0);
  });

  it('フロップフェーズでは3枚のカードが表示される', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="flop" 
        pot={1500}
        currentBet={0}
      />
    );
    
    expect(screen.getByText('フロップ')).toBeInTheDocument();
    
    // 3枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(3);
  });

  it('リバーフェーズでは5枚のカードが表示される', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="river" 
        pot={1500}
        currentBet={0}
      />
    );
    
    expect(screen.getByText('リバー')).toBeInTheDocument();
    
    // 5枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(5);
  });

  it('大きなポット額が正しくフォーマットされる', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="flop" 
        pot={1234567}
        currentBet={0}
      />
    );
    
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  it('大きなベット額が正しくフォーマットされる', () => {
    render(
      <CommunityArea 
        communityCards={mockCards} 
        gamePhase="flop" 
        pot={1500}
        currentBet={987654}
      />
    );
    
    expect(screen.getByText('現在のベット: $987,654')).toBeInTheDocument();
  });
}); 