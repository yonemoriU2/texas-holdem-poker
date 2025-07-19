import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CommunityCards from '../CommunityCards';
import type { Card, GamePhase } from '../../../types';

const mockCards: Card[] = [
  { rank: 'A', suit: 'hearts', id: 'A-hearts' },
  { rank: 'K', suit: 'diamonds', id: 'K-diamonds' },
  { rank: 'Q', suit: 'clubs', id: 'Q-clubs' },
  { rank: 'J', suit: 'spades', id: 'J-spades' },
  { rank: '10', suit: 'hearts', id: '10-hearts' }
];

describe('CommunityCards', () => {
  beforeEach(() => {
    // テスト間でのタイマーをクリア
    vi.clearAllTimers();
  });

  it('プリフロップフェーズではカードが表示されない', () => {
    render(<CommunityCards cards={mockCards} phase="preflop" />);
    
    expect(screen.getByText('プリフロップ')).toBeInTheDocument();
    expect(screen.getByText('0/5 コミュニティカード')).toBeInTheDocument();
    
    // プレースホルダーが5つ表示される
    const placeholders = screen.getAllByTestId(/card-placeholder/);
    expect(placeholders).toHaveLength(5);
  });

  it('フロップフェーズでは3枚のカードが表示される', () => {
    render(<CommunityCards cards={mockCards} phase="flop" />);
    
    expect(screen.getByText('フロップ')).toBeInTheDocument();
    expect(screen.getByText('3/5 コミュニティカード')).toBeInTheDocument();
    
    // 3枚のカードが表示される
    const communityCards = screen.getAllByTestId(/community-card-/);
    expect(communityCards).toHaveLength(3);
    
    // 2つのプレースホルダーが表示される
    const placeholders = screen.getAllByTestId(/card-placeholder/);
    expect(placeholders).toHaveLength(2);
  });

  it('ターンフェーズでは4枚のカードが表示される', () => {
    render(<CommunityCards cards={mockCards} phase="turn" />);
    
    expect(screen.getByText('ターン')).toBeInTheDocument();
    expect(screen.getByText('4/5 コミュニティカード')).toBeInTheDocument();
    
    // 4枚のカードが表示される
    const communityCards = screen.getAllByTestId(/community-card-/);
    expect(communityCards).toHaveLength(4);
    
    // 1つのプレースホルダーが表示される
    const placeholders = screen.getAllByTestId(/card-placeholder/);
    expect(placeholders).toHaveLength(1);
  });

  it('リバーフェーズでは5枚のカードが表示される', () => {
    render(<CommunityCards cards={mockCards} phase="river" />);
    
    expect(screen.getByText('リバー')).toBeInTheDocument();
    expect(screen.getByText('5/5 コミュニティカード')).toBeInTheDocument();
    
    // 5枚のカードが表示される
    const communityCards = screen.getAllByTestId(/community-card-/);
    expect(communityCards).toHaveLength(5);
    
    // プレースホルダーは表示されない
    const placeholders = screen.queryAllByTestId(/card-placeholder/);
    expect(placeholders).toHaveLength(0);
  });

  it('ショーダウンフェーズでは5枚のカードが表示される', () => {
    render(<CommunityCards cards={mockCards} phase="showdown" />);
    
    expect(screen.getByText('ショーダウン')).toBeInTheDocument();
    expect(screen.getByText('5/5 コミュニティカード')).toBeInTheDocument();
    
    // 5枚のカードが表示される
    const communityCards = screen.getAllByTestId(/community-card-/);
    expect(communityCards).toHaveLength(5);
  });

  it('ハンド終了フェーズでは5枚のカードが表示される', () => {
    render(<CommunityCards cards={mockCards} phase="ended" />);
    
    expect(screen.getByText('ハンド終了')).toBeInTheDocument();
    expect(screen.getByText('5/5 コミュニティカード')).toBeInTheDocument();
    
    // 5枚のカードが表示される
    const communityCards = screen.getAllByTestId(/community-card-/);
    expect(communityCards).toHaveLength(5);
  });

  it('カードが空の配列でも正しく動作する', () => {
    render(<CommunityCards cards={[]} phase="flop" />);
    
    expect(screen.getByText('フロップ')).toBeInTheDocument();
    expect(screen.getByText('0/5 コミュニティカード')).toBeInTheDocument();
    
    // プレースホルダーが5つ表示される
    const placeholders = screen.getAllByTestId(/card-placeholder/);
    expect(placeholders).toHaveLength(5);
  });

  it('カスタムクラス名が適用される', () => {
    render(<CommunityCards cards={mockCards} phase="flop" className="custom-class" />);
    
    const communityCardsArea = screen.getByTestId('community-cards');
    expect(communityCardsArea).toHaveClass('custom-class');
  });

  it('フェーズが変更されたときにカード表示が更新される', async () => {
    const { rerender } = render(<CommunityCards cards={mockCards} phase="preflop" />);
    
    // 最初はプリフロップ
    expect(screen.getByText('プリフロップ')).toBeInTheDocument();
    expect(screen.getByText('0/5 コミュニティカード')).toBeInTheDocument();
    
    // フロップに変更
    rerender(<CommunityCards cards={mockCards} phase="flop" />);
    
    expect(screen.getByText('フロップ')).toBeInTheDocument();
    expect(screen.getByText('3/5 コミュニティカード')).toBeInTheDocument();
    
    // 3枚のカードが表示される
    const communityCards = screen.getAllByTestId(/community-card-/);
    expect(communityCards).toHaveLength(3);
  });

  it('アニメーション無しでカードが即座に表示される', () => {
    render(<CommunityCards cards={mockCards} phase="flop" dealAnimation={false} />);
    
    // 即座に3枚のカードが表示される
    const communityCards = screen.getAllByTestId(/community-card-/);
    expect(communityCards).toHaveLength(3);
  });
});