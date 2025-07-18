# テキサスホールデムポーカー

React + TypeScript + Vite で実装されたテキサスホールデムポーカーゲームです。

## 🎮 デモ

[GitHub Pagesでプレイ](https://yonemoriu2.github.io/texas-holdem-poker/)

## 機能

- 🎮 完全なテキサスホールデムポーカールール
- 🤖 AI（CPU）プレイヤーとの対戦
- 🎯 ハンド評価システム
- 💰 ベッティングシステム（フォールド、チェック、コール、ベット、レイズ、オールイン）
- 🃏 美しいカード表示とアニメーション
- 📊 リアルタイムゲーム状態表示
- 🎨 モダンなUIデザイン（TailwindCSS）

## ゲームの流れ

1. **プリフロップ**: 各プレイヤーに2枚のホールカードが配られます
2. **フロップ**: 3枚のコミュニティカードが公開されます
3. **ターン**: 4枚目のコミュニティカードが公開されます
4. **リバー**: 5枚目のコミュニティカードが公開されます
5. **ショーダウン**: 残ったプレイヤーのハンドを比較して勝者を決定

## インストールと実行

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

## ゲームの操作方法

- **フォールド**: 手札を捨ててゲームから降りる
- **チェック**: ベットせずにパス（前のプレイヤーがチェックしている場合のみ可能）
- **コール**: 前のプレイヤーと同じ額をベット
- **ベット**: 新しいベットを開始
- **レイズ**: 前のプレイヤーのベット額を上回る額をベット
- **オールイン**: 持っているチップをすべてベット

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS
- **状態管理**: React Context API + useReducer
- **テスト**: Vitest

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── Card/           # カード表示コンポーネント
│   ├── Player/         # プレイヤー関連コンポーネント
│   ├── Community/      # コミュニティカードコンポーネント
│   ├── BettingActions/ # ベッティングアクションコンポーネント
│   ├── Game/           # ゲームボードコンポーネント
│   └── UI/             # 共通UIコンポーネント
├── context/            # React Context
├── utils/              # ユーティリティ関数
│   ├── handEvaluator.ts # ハンド評価ロジック
│   ├── aiLogic.ts      # AIロジック
│   ├── bettingUtils.ts # ベッティング計算
│   └── cardUtils.ts    # カード操作
├── types/              # TypeScript型定義
└── constants/          # 定数定義
```

## 開発

```bash
# テストを実行
npm run test

# ビルド
npm run build

# プレビュー
npm run preview

# GitHub Pages用ビルド
npm run build:gh-pages
```

## 🚀 デプロイメント

このプロジェクトはGitHub Actionsを使用してGitHub Pagesに自動デプロイされます。

### デプロイメント設定

1. **GitHub Pages設定**:
   - リポジトリのSettings > Pages
   - Source: "GitHub Actions"を選択

2. **自動デプロイメント**:
   - `main`ブランチにプッシュすると自動的にデプロイされます
   - デプロイメント状況は[Actions](https://github.com/yonemoriu2/texas-holdem-poker/actions)で確認できます

3. **手動デプロイメント**:
   ```bash
   npm run build:gh-pages
   ```

## ライセンス

MIT License
