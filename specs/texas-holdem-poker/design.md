# Design Document

## Overview

テキサスホールデムポーカーWebアプリケーションは、React 18、Vite、TailwindCSSを使用したシングルページアプリケーション（SPA）として設計されます。アプリケーションは完全にクライアントサイドで動作し、プレイヤーがCPU相手にテキサスホールデムポーカーをプレイできる環境を提供します。

## Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for高速な開発とビルド
- **Styling**: TailwindCSS for utility-first CSS
- **State Management**: React Context API + useReducer for game state
- **Component Structure**: 機能別に分割されたコンポーネント階層

### Application Structure
```
src/
├── components/
│   ├── Game/
│   │   ├── GameBoard.tsx
│   │   ├── PlayerArea.tsx
│   │   ├── CommunityCards.tsx
│   │   └── ActionButtons.tsx
│   ├── Card/
│   │   ├── Card.tsx
│   │   └── CardBack.tsx
│   └── UI/
│       ├── Button.tsx
│       ├── Chip.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useGameState.ts
│   ├── usePokerLogic.ts
│   └── useAI.ts
├── utils/
│   ├── cardUtils.ts
│   ├── handEvaluator.ts
│   ├── gameLogic.ts
│   └── aiLogic.ts
├── types/
│   ├── game.ts
│   ├── card.ts
│   └── player.ts
└── constants/
    └── poker.ts
```

## Components and Interfaces

### Core Data Types

```typescript
// Card representation
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  id: string;
}

// Player state
interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  hasActed: boolean;
  hasFolded: boolean;
  isAllIn: boolean;
}

// Game state
interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  activePlayer: number;
  deck: Card[];
  winner: string | null;
  winningHand: HandRank | null;
}

// Hand evaluation
interface HandRank {
  rank: number; // 1-10 (1 = high card, 10 = royal flush)
  name: string;
  cards: Card[];
  kickers: Card[];
}
```

### Component Hierarchy

#### GameBoard (Root Component)
- **Purpose**: メインゲームコンテナ、全体的なレイアウト管理
- **Props**: なし（Context経由でstate管理）
- **Children**: PlayerArea, CommunityCards, ActionButtons, GameInfo

#### PlayerArea
- **Purpose**: プレイヤーとCPUの情報表示（カード、チップ、ベット額）
- **Props**: `player: Player, isActive: boolean, showCards: boolean`
- **Features**: カードアニメーション、チップカウント、ベット表示

#### CommunityCards
- **Purpose**: フロップ、ターン、リバーカードの表示
- **Props**: `cards: Card[], phase: GamePhase`
- **Features**: カード出現アニメーション、段階的表示

#### ActionButtons
- **Purpose**: プレイヤーのアクション選択UI
- **Props**: `availableActions: Action[], onAction: (action: Action) => void`
- **Features**: 動的ボタン表示、ベット額スライダー

#### Card Component
- **Purpose**: 個別カード表示
- **Props**: `card: Card, faceUp: boolean, size: 'small' | 'medium' | 'large'`
- **Features**: フリップアニメーション、レスポンシブサイズ

## Data Models

### Game State Management
React Context + useReducer パターンを使用してゲーム状態を管理：

```typescript
// Game actions
type GameAction = 
  | { type: 'DEAL_CARDS' }
  | { type: 'PLAYER_ACTION'; payload: { action: string; amount?: number } }
  | { type: 'NEXT_PHASE' }
  | { type: 'EVALUATE_HANDS' }
  | { type: 'RESET_GAME' };

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  // Game logic implementation
};
```

### Hand Evaluation Algorithm
5枚のカードから最高のハンドを評価するアルゴリズム：

1. **カード組み合わせ生成**: 7枚（ホールカード2枚 + コミュニティカード5枚）から5枚の組み合わせを生成
2. **ハンドランク判定**: 各組み合わせをハンドランクで評価
3. **最高ハンド選択**: 最も高いランクのハンドを選択
4. **タイブレーカー**: 同じランクの場合はキッカーで比較

### AI Decision Making
CPUの意思決定ロジック：

```typescript
interface AIDecision {
  action: 'fold' | 'call' | 'raise';
  amount?: number;
  confidence: number;
}

// AI factors
- Hand strength (current hand rank)
- Pot odds calculation
- Position consideration
- Bluffing frequency (random factor)
- Betting pattern analysis
```

## Error Handling

### Client-Side Error Handling
1. **Game State Validation**: 各アクション前に状態の整合性チェック
2. **Input Validation**: ベット額、アクション選択の妥当性検証
3. **Fallback UI**: エラー発生時の代替表示
4. **Error Boundaries**: React Error Boundaryでコンポーネントエラーをキャッチ

### Error Recovery
- **Auto-recovery**: 軽微なエラーは自動修復
- **Game Reset**: 重大なエラー時はゲームリセット機能
- **User Feedback**: エラー内容をユーザーに分かりやすく表示

## Testing Strategy

### Unit Testing
- **Utilities Testing**: カード操作、ハンド評価ロジックのテスト
- **Component Testing**: React Testing Libraryを使用したコンポーネントテスト
- **Hook Testing**: カスタムフックの動作テスト

### Integration Testing
- **Game Flow Testing**: ゲーム全体の流れのテスト
- **AI Behavior Testing**: CPU行動の妥当性テスト
- **State Management Testing**: Context/Reducerの状態遷移テスト

### E2E Testing (Optional)
- **Complete Game Scenarios**: 完全なゲームプレイのシナリオテスト
- **User Interaction Testing**: UI操作の統合テスト

### Test Structure
```
src/
├── __tests__/
│   ├── utils/
│   │   ├── handEvaluator.test.ts
│   │   ├── gameLogic.test.ts
│   │   └── aiLogic.test.ts
│   ├── components/
│   │   ├── GameBoard.test.tsx
│   │   ├── PlayerArea.test.tsx
│   │   └── ActionButtons.test.tsx
│   └── hooks/
│       ├── useGameState.test.ts
│       └── usePokerLogic.test.ts
```

## Performance Considerations

### Optimization Strategies
1. **React.memo**: 不要な再レンダリングを防ぐ
2. **useMemo/useCallback**: 重い計算とコールバック関数のメモ化
3. **Code Splitting**: 必要に応じてコンポーネントの遅延読み込み
4. **Animation Performance**: CSS transformsを使用したスムーズなアニメーション

### Bundle Size Optimization
- **Tree Shaking**: 未使用コードの除去
- **TailwindCSS Purging**: 未使用CSSクラスの除去
- **Asset Optimization**: 画像とアイコンの最適化

## UI/UX Design Principles

### Visual Design
- **Card Design**: リアルなカード表現とクリアな視認性
- **Color Scheme**: ポーカーテーブルを模した緑基調のデザイン
- **Typography**: 読みやすいフォントとサイズ設定
- **Responsive Design**: モバイルとデスクトップ両対応

### User Experience
- **Intuitive Controls**: 直感的なボタン配置とアクション
- **Visual Feedback**: アクション結果の明確な表示
- **Animation**: ゲーム進行を助けるスムーズなアニメーション
- **Accessibility**: キーボードナビゲーションとスクリーンリーダー対応

### TailwindCSS Implementation
- **Utility Classes**: 一貫したスタイリング
- **Custom Components**: 再利用可能なUIコンポーネント
- **Responsive Breakpoints**: モバイルファーストデザイン
- **Dark Mode Support**: ダークモード対応（オプション）