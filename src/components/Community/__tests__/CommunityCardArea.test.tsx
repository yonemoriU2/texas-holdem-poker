import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CommunityCardArea from '../CommunityCardArea';
import type { Card } from '../../../types';

const mockCards: Card[] = [
  { id: '1', suit: 'hearts', rank: 'A' },
  { id: '2', suit: 'diamonds', rank: 'K' },
  { id: '3', suit: 'clubs', rank: 'Q' },
  { id: '4', suit: 'spades', rank: 'J' },
  { id: '5', suit: 'hearts', rank: '10' }
];

describe('CommunityCardArea', () => {
  it('プリフロップフェーズではカードが表示されない', () => {
    render(
      <CommunityCardArea 
        communityCards={mockCards} 
        gamePhase="preflop" 
      />
    );
    
    expect(screen.getByTestId('community-card-area')).toBeInTheDocument();
    expect(screen.getByText('プリフロップ')).toBeInTheDocument();
    
    // カードが表示されていないことを確認
    const cardElements = screen.queryAllByTestId('card');
    expect(cardElements).toHaveLength(0);
  });

  it('フロップフェーズでは3枚のカードが表示される', () => {
    render(
      <CommunityCardArea 
        communityCards={mockCards} 
        gamePhase="flop" 
      />
    );
    
    expect(screen.getByText('フロップ')).toBeInTheDocument();
    
    // 3枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(3);
    
    // 最初の3枚のカードが正しく表示されることを確認
    expect(screen.getAllByText('A')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('K')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('Q')).toHaveLength(2); // 左上と右下の両方
  });

  it('ターンフェーズでは4枚のカードが表示される', () => {
    render(
      <CommunityCardArea 
        communityCards={mockCards} 
        gamePhase="turn" 
      />
    );
    
    expect(screen.getByText('ターン')).toBeInTheDocument();
    
    // 4枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(4);
    
    // 最初の4枚のカードが正しく表示されることを確認
    expect(screen.getAllByText('A')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('K')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('Q')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('J')).toHaveLength(2); // 左上と右下の両方
  });

  it('リバーフェーズでは5枚のカードが表示される', () => {
    render(
      <CommunityCardArea 
        communityCards={mockCards} 
        gamePhase="river" 
      />
    );
    
    expect(screen.getByText('リバー')).toBeInTheDocument();
    
    // 5枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(5);
    
    // 全てのカードが正しく表示されることを確認
    expect(screen.getAllByText('A')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('K')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('Q')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('J')).toHaveLength(2); // 左上と右下の両方
    expect(screen.getAllByText('10')).toHaveLength(2); // 左上と右下の両方
  });

  it('ショーダウンフェーズでは5枚のカードが表示される', () => {
    render(
      <CommunityCardArea 
        communityCards={mockCards} 
        gamePhase="showdown" 
      />
    );
    
    expect(screen.getByText('ショーダウン')).toBeInTheDocument();
    
    // 5枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(5);
  });

  it('ゲーム終了フェーズでは5枚のカードが表示される', () => {
    render(
      <CommunityCardArea 
        communityCards={mockCards} 
        gamePhase="ended" 
      />
    );
    
    expect(screen.getByText('ゲーム終了')).toBeInTheDocument();
    
    // 5枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(5);
  });

  it('カードが5枚未満の場合でも正しく表示される', () => {
    const partialCards = mockCards.slice(0, 3);
    
    render(
      <CommunityCardArea 
        communityCards={partialCards} 
        gamePhase="river" 
      />
    );
    
    // 利用可能な3枚のカードが表示されることを確認
    const cardElements = screen.getAllByTestId('card');
    expect(cardElements).toHaveLength(3);
  });

  it('カードが空の場合でもエラーが発生しない', () => {
    render(
      <CommunityCardArea 
        communityCards={[]} 
        gamePhase="flop" 
      />
    );
    
    expect(screen.getByTestId('community-card-area')).toBeInTheDocument();
    expect(screen.getByText('フロップ')).toBeInTheDocument();
  });
}); 