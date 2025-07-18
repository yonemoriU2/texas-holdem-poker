# コミュニティカードエリア

テキサスホールデムポーカーのコミュニティカードエリアを実装したコンポーネント群です。

## コンポーネント一覧

### 1. CommunityCardArea
基本的なコミュニティカード表示コンポーネント

**機能:**
- ゲームフェーズに応じた段階的カード表示
- カード配布アニメーション
- フェーズ遷移時の視覚的フィードバック

**Props:**
```typescript
interface CommunityCardAreaProps {
  communityCards: Card[];    // コミュニティカード配列
  gamePhase: GamePhase;      // 現在のゲームフェーズ
  className?: string;        // 追加CSSクラス
}
```

**フェーズ別表示:**
- プリフロップ: カードなし
- フロップ: 3枚のカード
- ターン: 4枚のカード
- リバー/ショーダウン/終了: 5枚のカード

### 2. CommunityArea
完全なコミュニティエリアコンポーネント（ポット情報含む）

**機能:**
- コミュニティカード表示
- ポット額表示
- 現在のベット額表示
- ゲーム進行状況インジケーター

**Props:**
```typescript
interface CommunityAreaProps {
  communityCards: Card[];    // コミュニティカード配列
  gamePhase: GamePhase;      // 現在のゲームフェーズ
  pot: number;               // ポット額
  currentBet: number;        // 現在のベット額
  className?: string;        // 追加CSSクラス
}
```

## アニメーション機能

### カード配布アニメーション
- カードが順次表示されるアニメーション
- 各カードに遅延時間を設定（150ms間隔）
- フェーズ遷移時のパルス効果

### フェーズ遷移アニメーション
- フェーズ名の色変化（黄色ハイライト）
- カードの一時的な拡大・回転効果
- 背景のパルス効果

## スタイリング

### カードデザイン
- 標準的なポーカーカードデザイン
- スート別色分け（ハート・ダイヤ: 赤、クラブ・スペード: 黒）
- レスポンシブサイズ対応（small, medium, large）

### エリアデザイン
- 緑色のポーカーテーブ風デザイン
- 影とボーダーで立体感を演出
- 黄色のポット表示で視認性向上

## テスト

### テストファイル
- `CommunityCardArea.test.tsx`: 基本的なカード表示機能のテスト
- `CommunityArea.test.tsx`: 完全なエリア機能のテスト

### テスト内容
- 各フェーズでのカード表示数
- ポット額とベット額の表示
- アニメーション状態の確認
- エッジケース（空配列、部分配列）の処理

## デモ

### CommunityCardAreaDemo
基本的なカード表示機能のデモ

### CommunityAreaDemo
完全な機能（ポット情報含む）のデモ

**デモ機能:**
- フェーズ手動切り替え
- オートプレイ機能
- ポット額の動的変更
- ベット額のシミュレーション

## 使用方法

```tsx
import { CommunityArea } from './components/Community';

function GameBoard() {
  const [gameState, setGameState] = useState({
    communityCards: [...],
    gamePhase: 'flop',
    pot: 1500,
    currentBet: 200
  });

  return (
    <CommunityArea
      communityCards={gameState.communityCards}
      gamePhase={gameState.gamePhase}
      pot={gameState.pot}
      currentBet={gameState.currentBet}
    />
  );
}
```

## 要件対応

この実装は以下の要件を満たしています：

- [x] 5枚のコミュニティカード表示エリア
- [x] フロップ、ターン、リバーの段階的カード表示
- [x] カード出現アニメーション
- [x] ポット額とベット額の表示
- [x] ゲーム進行状況の視覚的フィードバック
- [x] レスポンシブデザイン
- [x] 包括的なテストカバレッジ 