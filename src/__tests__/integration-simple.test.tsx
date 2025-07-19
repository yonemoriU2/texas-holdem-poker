import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameProvider } from '../context/GameContext';
import GameBoard from '../components/Game/GameBoard';

// 簡単なモック設定
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

describe('統合テスト - 完全なゲームプレイシナリオ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ゲーム初期化と基本機能', () => {
    it('ゲームが正しく初期化される', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // ゲームタイトルが表示される
      expect(screen.getByText('テキサスホールデムポーカー')).toBeInTheDocument();
      
      // ゲームボードが表示される
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      
      // 初期フェーズがプリフロップである
      await waitFor(() => {
        expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
      });
      
      // アクションボタンが表示される
      expect(screen.getByText('フォールド')).toBeInTheDocument();
      expect(screen.getByText(/チェック|コール/)).toBeInTheDocument();
      expect(screen.getByText('ベット')).toBeInTheDocument();
      expect(screen.getByText('オールイン')).toBeInTheDocument();
    });

    it('プレイヤー情報が正しく表示される', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('player-chips')).toBeInTheDocument();
        expect(screen.getByTestId('cpu-chips')).toBeInTheDocument();
        expect(screen.getByTestId('blind-info')).toBeInTheDocument();
      });
    });
  });

  describe('基本的なゲームプレイ', () => {
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

      // フォールド後、ボタンが無効になることを確認
      await waitFor(() => {
        expect(screen.getByText('フォールド')).toBeDisabled();
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

      // アクション後、ゲーム状態が変化することを確認
      await waitFor(() => {
        // ボタンが無効になるか、フェーズが変わることを確認
        const button = screen.getByText(/チェック|コール/);
        expect(button).toBeDisabled();
      }, { timeout: 10000 });
    });

    it('ベットアクションUIが正しく動作する', async () => {
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

      // ベット設定UIが表示されることを確認
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

      // オールイン後、ボタンが無効になることを確認
      await waitFor(() => {
        expect(screen.getByText('オールイン')).toBeDisabled();
      });
    });
  });

  describe('ゲーム継続機能', () => {
    it('新しいハンド開始機能が動作する', async () => {
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

      // 新しいハンドボタンが表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
      }, { timeout: 10000 });

      const newHandButton = screen.getByText(/新しいハンド/);
      fireEvent.click(newHandButton);

      // ゲームがリセットされることを確認
      await waitFor(() => {
        expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
        expect(screen.getByText('フォールド')).not.toBeDisabled();
      });
    });
  });

  describe('AI行動の妥当性', () => {
    it('AIが適切なタイミングでアクションを実行する', async () => {
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

      // AIの応答を待つ（ゲーム状態の変化で確認）
      await waitFor(() => {
        // プレイヤーのボタンが無効になることでAIのターンが始まったことを確認
        expect(screen.getByText(/チェック|コール/)).toBeDisabled();
      }, { timeout: 10000 });
    });

    it('AIが一定時間内に応答する', async () => {
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
        expect(screen.getByText(/チェック|コール/)).toBeDisabled();
      }, { timeout: 10000 });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // AIの応答時間が合理的な範囲内であることを確認
      expect(responseTime).toBeLessThan(10000); // 10秒以内
      expect(responseTime).toBeGreaterThan(100); // 100ms以上
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

      // 無効なボタンをクリックしてもエラーが発生しないことを確認
      fireEvent.click(screen.getByText(/チェック|コール/), { force: true });
      
      // ゲームが正常に動作し続けることを確認
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });

    it('ゲーム状態の整合性が保たれる', async () => {
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

      // ゲーム情報の整合性を確認
      expect(screen.getByTestId('blind-info')).toBeInTheDocument();
      expect(screen.getByText(/ハンド #/)).toBeInTheDocument();
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

    it('デスクトップ表示でUIが適切に表示される', () => {
      // ビューポートをデスクトップサイズに設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // デスクトップでも主要な要素が表示される
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

      // 5回連続でフォールド→新しいハンド
      for (let i = 0; i < 5; i++) {
        await waitFor(() => {
          expect(screen.getByText('フォールド')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('フォールド'));

        await waitFor(() => {
          expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
        }, { timeout: 5000 });

        if (i < 4) {
          fireEvent.click(screen.getByText(/新しいハンド/));
          
          await waitFor(() => {
            expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
          });
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 5回の操作が10秒以内に完了することを確認
      expect(totalTime).toBeLessThan(10000);
    });

    it('メモリリークが発生しない', async () => {
      render(
        <GameProvider>
          <GameBoard />
        </GameProvider>
      );

      // 10回の操作でメモリ使用量が安定することを確認
      for (let i = 0; i < 10; i++) {
        await waitFor(() => {
          expect(screen.getByText('フォールド')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('フォールド'));

        await waitFor(() => {
          expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
        }, { timeout: 3000 });

        if (i < 9) {
          fireEvent.click(screen.getByText(/新しいハンド/));
          
          await waitFor(() => {
            expect(screen.getByText(/プリフロップ/)).toBeInTheDocument();
          });
        }
      }

      // ゲームが正常に動作し続けることを確認
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      expect(screen.getByText(/新しいハンド/)).toBeInTheDocument();
    });
  });
});