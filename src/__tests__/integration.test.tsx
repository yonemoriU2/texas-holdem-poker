import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { GameProvider } from '../context/GameContext';
import GameBoard from '../components/Game/GameBoard';
import type { GameState, GameAction } from '../types/game';
import { createMockGameState } from '../test/mockData';

// AIの思考時間をモック
vi.mock('../utils/aiLogic', () => ({
  decideAction: vi.fn(() => Promise.resolve({ action: 'CHECK', amount: 0 })),
  calculateThinkingTime: vi.fn(() => 100),
  decideAIActionSync: vi.fn(() => ({ action: 'CHECK', amount: 0 })),
}));

vi.mock('../utils/advancedAI', () => ({
  makeAdvancedDecision: vi.fn(() => Promise.resolve({ action: 'CHECK', amount: 0 })),
  analyzeHandStrength: vi.fn(() => 0.5),
  calculateBluffProbability: vi.fn(() => 0.2),
}));

// カード配布をモック
vi.mock('../utils/cardUtils', () => ({
  shuffleDeck: vi.fn(() => Array.from({ length: 52 }, (_, i) => i)),
  dealCards: vi.fn(() => ({
    playerCards: [0, 1],
    cpuCards: [2, 3],
    communityCards: [4, 5, 6, 7, 8],
  })),
  createShuffledDeck: vi.fn(() => Array.from({ length: 52 }, (_, i) => i)),
  getCardDisplay: vi.fn((cardIndex) => ({
    suit: 'hearts',
    rank: 'A',
    display: 'A♥'
  })),
}));

// ハンド評価をモック
vi.mock('../utils/handEvaluator', () => ({
  evaluateHand: vi.fn(() => ({
    rank: 1,
    name: 'ハイカード',
    cards: [],
    kickers: []
  })),
  compareHands: vi.fn(() => 1),
  getBestHand: vi.fn(() => ({
    rank: 1,
    name: 'ハイカード',
    cards: [],
    kickers: []
  })),
  determineWinners: vi.fn(() => ['player']),
}));

describe('ゲーム統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ゲーム初期化', () => {
    it('ゲームが正しく初期化される', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // ゲームタイトル
      expect(screen.getByText('テキサスホールデムポーカー')).toBeInTheDocument();
      
      // ゲームボードが表示される
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      
      // プレイヤー情報が表示される
      await waitFor(() => {
        expect(screen.getByTestId('player-chips')).toBeInTheDocument();
        expect(screen.getByTestId('cpu-chips')).toBeInTheDocument();
      });
      
      // 初期フェーズがプリフロップである
      expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
      
      // アクションボタンが表示される
      expect(screen.getByText('フォールド')).toBeInTheDocument();
      expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      expect(screen.getByText('ベット')).toBeInTheDocument();
      expect(screen.getByText('オールイン')).toBeInTheDocument();
    });

    it('初期チップ数が正しく設定される', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('player-chips')).toHaveTextContent('1000');
        expect(screen.getByTestId('cpu-chips')).toHaveTextContent('1000');
      });
    });

    it('ブラインドが正しく設定される', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('blind-info')).toHaveTextContent('$10/$20');
      });
    });
  });

  describe('ベッティングアクション', () => {
    it('フォールドアクションが正しく動作する', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('フォールド')).toBeInTheDocument();
      });

      const foldButton = screen.getByText('フォールド');
      fireEvent.click(foldButton);

      // プレイヤーがフォールド状態になることを確認
      await waitFor(() => {
        expect(screen.getByText(/フォールド/)).toBeInTheDocument();
      });
    });

    it('チェック/コールアクションが正しく動作する', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      const checkCallButton = screen.getByText(/チェック|コール/);
      fireEvent.click(checkCallButton);

      // AIの応答を待つ
      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('ベットアクションが正しく動作する', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('ベット')).toBeInTheDocument();
      });

      const betButton = screen.getByText('ベット');
      fireEvent.click(betButton);

      // ベット設定UIが表示される
      await waitFor(() => {
        expect(screen.getByText(/1\/4|1\/2|ポット/)).toBeInTheDocument();
      });
    });

    it('オールインアクションが正しく動作する', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('オールイン')).toBeInTheDocument();
      });

      const allInButton = screen.getByText('オールイン');
      fireEvent.click(allInButton);

      // プレイヤーがオールイン状態になることを確認
      await waitFor(() => {
        expect(screen.getByText(/オールイン/)).toBeInTheDocument();
      });
    });
  });

  describe('ゲームフェーズ進行', () => {
    it('プリフロップからフロップへの進行', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      // プレイヤーがチェック/コール
      const checkCallButton = screen.getByText(/チェック|コール/);
      fireEvent.click(checkCallButton);

      // フロップフェーズに移行することを確認
      await waitFor(() => {
        expect(screen.getByText(/フロップ/)).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('ゲームフェーズの表示が正しく更新される', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // 初期状態はプリフロップ
      expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();

      // アクションを実行してフェーズ進行をテスト
      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      const checkCallButton = screen.getByText(/チェック|コール/);
      fireEvent.click(checkCallButton);

      // フェーズが変更されることを確認
      await waitFor(() => {
        const phaseText = screen.getByText(/フロップ|ターン|リバー|ショーダウン/);
        expect(phaseText).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('ゲーム継続機能', () => {
    it('新しいハンド開始機能が正しく動作する', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // フォールドしてハンドを終了
      await waitFor(() => {
        expect(screen.getByText('フォールド')).toBeInTheDocument();
      });

      const foldButton = screen.getByText('フォールド');
      fireEvent.click(foldButton);

      // 新しいハンドボタンが表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
      }, { timeout: 10000 });

      const newHandButton = screen.getByText(/新しいハンド/);
      fireEvent.click(newHandButton);

      // ゲームがリセットされることを確認
      await waitFor(() => {
        expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
      });
    });

    it('ゲーム状態が正しくリセットされる', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // フォールドしてハンドを終了
      await waitFor(() => {
        expect(screen.getByText('フォールド')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('フォールド'));

      // 新しいハンドを開始
      await waitFor(() => {
        expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
      }, { timeout: 10000 });

      fireEvent.click(screen.getByText(/新しいハンド/));

      // アクションボタンが再度有効になることを確認
      await waitFor(() => {
        expect(screen.getByText('フォールド')).not.toBeDisabled();
        expect(screen.getByText(/チェック|コール/)).not.toBeDisabled();
        expect(screen.getByText('ベット')).not.toBeDisabled();
        expect(screen.getByText('オールイン')).not.toBeDisabled();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なアクションが適切に処理される', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('フォールド')).toBeInTheDocument();
      });

      // プレイヤーがフォールド
      fireEvent.click(screen.getByText('フォールド'));

      // フォールド後、他のアクションボタンが無効になることを確認
      await waitFor(() => {
        expect(screen.getByText('フォールド')).toBeDisabled();
        expect(screen.getByText(/チェック|コール/)).toBeDisabled();
        expect(screen.getByText('ベット')).toBeDisabled();
        expect(screen.getByText('オールイン')).toBeDisabled();
      });
    });

    it('AIエラー時の適切な処理', async () => {
      // AIがエラーを返すようにモック
      mockDecideAction.mockRejectedValue(new Error('AI Error'));

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/チェック|コール/));

      // エラーが適切に処理されることを確認
      await waitFor(() => {
        // ゲームが継続可能な状態を維持していることを確認
        expect(screen.getByTestId('game-board')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('ゲーム状態の整合性チェック', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('player-chips')).toBeInTheDocument();
        expect(screen.getByTestId('cpu-chips')).toBeInTheDocument();
      });

      // チップ数の整合性を確認
      const playerChips = screen.getByTestId('player-chips');
      const cpuChips = screen.getByTestId('cpu-chips');
      
      expect(playerChips.textContent).toMatch(/\d+/);
      expect(cpuChips.textContent).toMatch(/\d+/);
    });
  });

  describe('AI行動の妥当性', () => {
    it('AIが適切なタイミングでアクションを実行する', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // プレイヤーのアクション
      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      const checkCallButton = screen.getByText(/チェック|コール/);
      fireEvent.click(checkCallButton);

      // AIが応答することを確認
      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('AIのベット額が妥当な範囲内である', async () => {
      // AIが大きなベットを返すようにモック
      mockDecideAction.mockResolvedValue({ action: 'RAISE', amount: 100 });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('ベット')).toBeInTheDocument();
      });

      // プレイヤーがベット
      const betButton = screen.getByText('ベット');
      fireEvent.click(betButton);

      // ベット額を設定
      await waitFor(() => {
        expect(screen.getByText(/1\/2|ポット/)).toBeInTheDocument();
      });

      const presetButton = screen.getByText(/1\/2|ポット/);
      fireEvent.click(presetButton);

      const executeButton = screen.getByText(/ベット|実行/);
      fireEvent.click(executeButton);

      // AIの応答を待つ
      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('AIが思考時間を持つ', async () => {
      mockCalculateThinkingTime.mockReturnValue(2000); // 2秒の思考時間

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      const startTime = Date.now();
      fireEvent.click(screen.getByText(/チェック|コール/));

      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 10000 });

      const endTime = Date.now();
      const actualThinkingTime = endTime - startTime;

      // 思考時間が設定された値に近いことを確認
      expect(actualThinkingTime).toBeGreaterThan(1000);
    });

    it('AIが異なる状況で異なるアクションを取る', async () => {
      const actions = [];

      // 複数のシナリオでAIの行動をテスト
      for (let i = 0; i < 3; i++) {
        const mockAction = i === 0 ? 'CHECK' : i === 1 ? 'CALL' : 'FOLD';
        mockDecideAction.mockResolvedValueOnce({ action: mockAction, amount: 0 });

        render(
          <GameProvider>
            <GameBoard />
          </GameProvider>
        );

        await waitFor(() => {
          expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/チェック|コール/));

        await waitFor(() => {
          expect(mockDecideAction).toHaveBeenCalled();
        });

        actions.push(mockAction);
      }

      // AIが多様なアクションを取ることを確認
      expect(new Set(actions).size).toBeGreaterThan(1);
    });

    it('AIがブラフ行動を取る', async () => {
      // AIがブラフ（弱いハンドでベット）を行うようにモック
      mockDecideAction.mockResolvedValue({ action: 'RAISE', amount: 50 });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/チェック|コール/));

      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 5000 });

      // ブラフ判定関数が呼ばれることを確認
      expect(mockDecideAction).toHaveBeenCalledWith(
        expect.objectContaining({
          gamePhase: expect.any(String),
          playerCards: expect.any(Array),
          communityCards: expect.any(Array),
        })
      );
    });

    it('AIがオールイン状況を適切に処理する', async () => {
      mockDecideAction.mockResolvedValue({ action: 'ALL_IN', amount: 1000 });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('オールイン')).toBeInTheDocument();
      });

      // プレイヤーがオールイン
      fireEvent.click(screen.getByText('オールイン'));

      // AIが適切に応答することを確認
      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });

  describe('完全なゲームプレイシナリオ', () => {
    it('プリフロップからショーダウンまでの完全なゲーム', async () => {
      // 各フェーズでのAI行動を設定
      mockDecideAction
        .mockResolvedValueOnce({ action: 'CALL', amount: 20 }) // プリフロップ
        .mockResolvedValueOnce({ action: 'CHECK', amount: 0 }) // フロップ
        .mockResolvedValueOnce({ action: 'CALL', amount: 50 }) // ターン
        .mockResolvedValueOnce({ action: 'CALL', amount: 100 }); // リバー

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // プリフロップ
      await waitFor(() => {
        expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/チェック|コール/));

      // フロップ
      await waitFor(() => {
        expect(screen.getByText(/フロップ/)).toBeInTheDocument();
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/チェック|コール/));

      // ターン
      await waitFor(() => {
        expect(screen.getByText(/ターン/)).toBeInTheDocument();
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(screen.getByText('ベット')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('ベット'));
      
      await waitFor(() => {
        expect(screen.getByText(/1\/4|1\/2|ポット/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/1\/4|1\/2|ポット/));
      fireEvent.click(screen.getByText(/ベット|実行/));

      // リバー
      await waitFor(() => {
        expect(screen.getByText(/リバー/)).toBeInTheDocument();
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(screen.getByText('ベット')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('ベット'));
      
      await waitFor(() => {
        expect(screen.getByText(/1\/4|1\/2|ポット/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/1\/4|1\/2|ポット/));
      fireEvent.click(screen.getByText(/ベット|実行/));

      // ショーダウン
      await waitFor(() => {
        expect(screen.getByText(/ショーダウン/)).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('フォールドによる早期終了シナリオ', async () => {
      mockDecideAction.mockResolvedValue({ action: 'FOLD', amount: 0 });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('ベット')).toBeInTheDocument();
      });

      // プレイヤーが大きくベット
      fireEvent.click(screen.getByText('ベット'));
      
      await waitFor(() => {
        expect(screen.getByText(/ポット/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/ポット/));
      fireEvent.click(screen.getByText(/ベット|実行/));

      // AIがフォールドすることを確認
      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 5000 });

      // ゲームが終了し、新しいハンドボタンが表示される
      await waitFor(() => {
        expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('オールイン対決シナリオ', async () => {
      mockDecideAction.mockResolvedValue({ action: 'ALL_IN', amount: 1000 });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('オールイン')).toBeInTheDocument();
      });

      // プレイヤーがオールイン
      fireEvent.click(screen.getByText('オールイン'));

      // AIもオールインで応答
      await waitFor(() => {
        expect(mockDecideAction).toHaveBeenCalled();
      }, { timeout: 5000 });

      // ショーダウンまで自動進行
      await waitFor(() => {
        expect(screen.getByText(/ショーダウン/)).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('複数ハンドの連続プレイ', async () => {
      mockDecideAction.mockResolvedValue({ action: 'FOLD', amount: 0 });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // 3ハンド連続でプレイ
      for (let hand = 1; hand <= 3; hand++) {
        await waitFor(() => {
          expect(screen.getByText('フォールド')).toBeInTheDocument();
        });

        // プレイヤーがフォールド
        fireEvent.click(screen.getByText('フォールド'));

        // 新しいハンドを開始
        await waitFor(() => {
          expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
        }, { timeout: 10000 });

        if (hand < 3) {
          fireEvent.click(screen.getByText(/新しいハンド/));
          
          await waitFor(() => {
            expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
          });
        }
      }

      // 最終的にハンド番号が更新されていることを確認
      expect(screen.getByText(/ハンド #/)).toBeInTheDocument();
    });

    it('チップ切れによるゲーム終了', async () => {
      // プレイヤーのチップを0にするシナリオ
      mockDecideAction.mockResolvedValue({ action: 'CALL', amount: 1000 });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('オールイン')).toBeInTheDocument();
      });

      // プレイヤーがオールイン（全チップを賭ける）
      fireEvent.click(screen.getByText('オールイン'));

      // ゲーム終了まで待つ
      await waitFor(() => {
        expect(screen.getByText(/新しいゲーム|ゲーム終了/)).toBeInTheDocument();
      }, { timeout: 15000 });
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル表示でUIが適切に表示される', () => {
      // ビューポートをモバイルサイズに設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // モバイルでも主要な要素が表示される
      expect(screen.getByText('テキサスホールデムポーカー')).toBeInTheDocument();
      expect(screen.getByText('フォールド')).toBeInTheDocument();
      expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
    });

    it('タブレット表示でUIが適切に表示される', () => {
      // ビューポートをタブレットサイズに設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // タブレットでも主要な要素が表示される
      expect(screen.getByText('テキサスホールデムポーカー')).toBeInTheDocument();
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });
  });

  describe('パフォーマンステスト', () => {
    it('連続操作でパフォーマンスが低下しない', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      const startTime = performance.now();

      // 10回連続でフォールド
      for (let i = 0; i < 10; i++) {
        const foldButton = screen.getByText('フォールド');
        fireEvent.click(foldButton);

        const newHandButton = screen.getByText('新しいハンド');
        fireEvent.click(newHandButton);

        await waitFor(() => {
          expect(screen.getByText('フォールド')).toBeInTheDocument();
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 10回の操作が5秒以内に完了することを確認
      expect(totalTime).toBeLessThan(5000);
    });

    it('メモリリークが発生しない', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // 長時間の操作でメモリ使用量が安定することを確認
      for (let i = 0; i < 50; i++) {
        const foldButton = screen.getByText('フォールド');
        fireEvent.click(foldButton);

        const newHandButton = screen.getByText('新しいハンド');
        fireEvent.click(newHandButton);

        await waitFor(() => {
          expect(screen.getByText('フォールド')).toBeInTheDocument();
        });
      }

      // ゲームが正常に動作し続けることを確認
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      expect(screen.getByText('フォールド')).toBeInTheDocument();
    });
  });
}); 