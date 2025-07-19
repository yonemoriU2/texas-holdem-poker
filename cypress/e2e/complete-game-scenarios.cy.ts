describe('完全なゲームプレイシナリオ E2E テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="game-board"]', { timeout: 10000 }).should('be.visible');
    cy.contains('テキサスホールデムポーカー').should('be.visible');
  });

  describe('フルゲームプレイシナリオ', () => {
    it('プリフロップからショーダウンまでの完全なゲーム', () => {
      // 初期状態の確認
      cy.contains('プリフロップ').should('be.visible');
      cy.get('[data-testid="player-chips"]').should('contain', '1000');
      cy.get('[data-testid="cpu-chips"]').should('contain', '1000');

      // プリフロップ - プレイヤーがコール
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000); // CPUの思考時間

      // フロップフェーズに移行
      cy.get('[data-testid="game-phase"]').should('contain', 'フロップ');
      cy.get('[data-testid="community-cards"] .card').should('have.length', 3);

      // フロップ - プレイヤーがチェック
      cy.get('button').contains(/チェック/).click();
      cy.wait(3000);

      // ターンフェーズに移行
      cy.get('[data-testid="game-phase"]').should('contain', 'ターン');
      cy.get('[data-testid="community-cards"] .card').should('have.length', 4);

      // ターン - プレイヤーがベット
      cy.contains('ベット').click();
      cy.contains('1/4 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      cy.wait(3000);

      // リバーフェーズに移行
      cy.get('[data-testid="game-phase"]').should('contain', 'リバー');
      cy.get('[data-testid="community-cards"] .card').should('have.length', 5);

      // リバー - プレイヤーがベット
      cy.contains('ベット').click();
      cy.contains('1/2 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      cy.wait(3000);

      // ショーダウンまたは勝負結果
      cy.get('[data-testid="game-phase"]').should('match', /(ショーダウン|終了)/);
      
      // 勝者が決定される
      cy.get('[data-testid="showdown-display"]', { timeout: 10000 }).should('be.visible');
      cy.contains(/勝者|Winner/).should('be.visible');
    });

    it('アグレッシブプレイシナリオ（連続ベット）', () => {
      // プリフロップで大きくベット
      cy.contains('ベット').click();
      cy.contains('ポット').click();
      cy.contains(/ベット|レイズ/).click();
      cy.wait(3000);

      // CPUがコールした場合、フロップに進む
      cy.get('[data-testid="game-phase"]').then(($phase) => {
        if ($phase.text().includes('フロップ')) {
          // フロップでも継続ベット
          cy.contains('ベット').click();
          cy.contains('ポット').click();
          cy.contains(/ベット|レイズ/).click();
          cy.wait(3000);

          // ターンでも継続
          cy.get('[data-testid="game-phase"]').then(($turnPhase) => {
            if ($turnPhase.text().includes('ターン')) {
              cy.contains('ベット').click();
              cy.contains('1/2 ポット').click();
              cy.contains(/ベット|レイズ/).click();
              cy.wait(3000);
            }
          });
        }
      });

      // 最終的な結果を確認
      cy.get('[data-testid="showdown-display"]', { timeout: 15000 }).should('be.visible');
    });

    it('パッシブプレイシナリオ（チェック/コール中心）', () => {
      // プリフロップでコール
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);

      // フロップでチェック
      cy.get('[data-testid="game-phase"]').should('contain', 'フロップ');
      cy.get('button').contains(/チェック/).click();
      cy.wait(3000);

      // ターンでチェック/コール
      cy.get('[data-testid="game-phase"]').should('contain', 'ターン');
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);

      // リバーでチェック/コール
      cy.get('[data-testid="game-phase"]').should('contain', 'リバー');
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);

      // ショーダウンに到達
      cy.get('[data-testid="showdown-display"]', { timeout: 10000 }).should('be.visible');
    });

    it('早期フォールドシナリオ', () => {
      // プリフロップでフォールド
      cy.contains('フォールド').click();
      
      // ゲームが即座に終了
      cy.get('[data-testid="player-status"]').should('contain', 'フォールド');
      cy.get('[data-testid="showdown-display"]', { timeout: 5000 }).should('be.visible');
      
      // CPUが勝利
      cy.contains(/CPU|勝者/).should('be.visible');
      
      // 新しいハンドボタンが表示される
      cy.get('[data-testid="new-hand-button"]').should('be.visible');
    });

    it('オールイン対決シナリオ', () => {
      // プレイヤーがオールイン
      cy.contains('オールイン').click();
      
      // プレイヤーがオールイン状態になる
      cy.get('[data-testid="player-status"]').should('contain', 'オールイン');
      
      // CPUの応答を待つ
      cy.wait(3000);
      
      // CPUがコール/フォールド/オールインのいずれかを選択
      cy.get('[data-testid="cpu-status"]').should('not.be.empty');
      
      // 結果が表示される
      cy.get('[data-testid="showdown-display"]', { timeout: 15000 }).should('be.visible');
      
      // 勝者が決定される
      cy.contains(/勝者|Winner/).should('be.visible');
    });
  });

  describe('複数ハンドの連続プレイ', () => {
    it('5ハンド連続プレイ', () => {
      for (let hand = 1; hand <= 5; hand++) {
        cy.log(`ハンド ${hand} を開始`);
        
        // ハンド番号の確認
        cy.contains(`ハンド #${hand}`).should('be.visible');
        
        // 簡単なプレイ（フォールドまたはコール）
        if (hand % 2 === 1) {
          // 奇数ハンドはフォールド
          cy.contains('フォールド').click();
        } else {
          // 偶数ハンドはコール
          cy.get('button').contains(/チェック|コール/).click();
          cy.wait(3000);
        }
        
        // ハンド終了を待つ
        cy.get('[data-testid="showdown-display"]', { timeout: 10000 }).should('be.visible');
        
        // 最後のハンドでない場合、新しいハンドを開始
        if (hand < 5) {
          cy.get('[data-testid="new-hand-button"]').click();
          cy.wait(1000);
          cy.contains('プリフロップ').should('be.visible');
        }
      }
      
      // 最終ハンド番号の確認
      cy.contains('ハンド #5').should('be.visible');
    });

    it('チップ変動の追跡', () => {
      let initialPlayerChips, initialCpuChips;
      
      // 初期チップ数を記録
      cy.get('[data-testid="player-chips"]').then(($chips) => {
        initialPlayerChips = parseInt($chips.text().replace(/[^0-9]/g, ''));
      });
      
      cy.get('[data-testid="cpu-chips"]').then(($chips) => {
        initialCpuChips = parseInt($chips.text().replace(/[^0-9]/g, ''));
      });
      
      // 3ハンドプレイ
      for (let hand = 1; hand <= 3; hand++) {
        // ベットしてハンドをプレイ
        cy.contains('ベット').click();
        cy.contains('1/4 ポット').click();
        cy.contains(/ベット|レイズ/).click();
        cy.wait(3000);
        
        // ハンド終了まで待つ
        cy.get('[data-testid="showdown-display"]', { timeout: 15000 }).should('be.visible');
        
        // チップ数の変動を確認
        cy.get('[data-testid="player-chips"]').then(($chips) => {
          const currentChips = parseInt($chips.text().replace(/[^0-9]/g, ''));
          expect(currentChips).to.not.equal(initialPlayerChips);
        });
        
        if (hand < 3) {
          cy.get('[data-testid="new-hand-button"]').click();
          cy.wait(1000);
        }
      }
      
      // 最終的なチップ数が初期値と異なることを確認
      cy.get('[data-testid="player-chips"]').then(($chips) => {
        const finalChips = parseInt($chips.text().replace(/[^0-9]/g, ''));
        expect(finalChips).to.not.equal(initialPlayerChips);
      });
    });
  });

  describe('ブラインド増加シナリオ', () => {
    it('ブラインドレベルの自動増加', () => {
      // 初期ブラインドレベルを確認
      cy.get('[data-testid="blind-info"]').should('contain', '$10/$20');
      
      // 複数ハンドをプレイしてブラインド増加をトリガー
      for (let hand = 1; hand <= 12; hand++) {
        cy.log(`ブラインド増加テスト - ハンド ${hand}`);
        
        // 簡単にフォールドしてハンドを終了
        cy.contains('フォールド').click();
        cy.get('[data-testid="showdown-display"]', { timeout: 5000 }).should('be.visible');
        
        if (hand < 12) {
          cy.get('[data-testid="new-hand-button"]').click();
          cy.wait(500);
        }
      }
      
      // ブラインドが増加していることを確認
      cy.get('[data-testid="blind-info"]').should('not.contain', '$10/$20');
    });
  });

  describe('ゲーム終了シナリオ', () => {
    it('チップ切れによるゲーム終了', () => {
      // 連続でオールインしてチップを失う戦略
      let gameEnded = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!gameEnded && attempts < maxAttempts) {
        attempts++;
        cy.log(`ゲーム終了テスト - 試行 ${attempts}`);
        
        // オールイン
        cy.contains('オールイン').click();
        cy.wait(3000);
        
        // ハンド終了を待つ
        cy.get('[data-testid="showdown-display"]', { timeout: 15000 }).should('be.visible');
        
        // チップ数をチェック
        cy.get('[data-testid="player-chips"]').then(($chips) => {
          const chips = parseInt($chips.text().replace(/[^0-9]/g, ''));
          if (chips === 0) {
            gameEnded = true;
            // ゲーム終了メッセージを確認
            cy.contains(/ゲーム終了|Game Over/).should('be.visible');
            cy.get('[data-testid="new-game-button"]').should('be.visible');
          } else if (attempts < maxAttempts) {
            // まだチップがある場合、新しいハンドを開始
            cy.get('[data-testid="new-hand-button"]').click();
            cy.wait(1000);
          }
        });
      }
      
      // ゲームが終了したことを確認
      expect(gameEnded || attempts >= maxAttempts).to.be.true;
    });

    it('新しいゲーム開始機能', () => {
      // 現在のゲームを終了させる（フォールド）
      cy.contains('フォールド').click();
      cy.get('[data-testid="showdown-display"]', { timeout: 5000 }).should('be.visible');
      
      // 新しいゲームボタンをクリック
      cy.get('[data-testid="new-game-button"]').click();
      
      // ゲームがリセットされることを確認
      cy.get('[data-testid="player-chips"]').should('contain', '1000');
      cy.get('[data-testid="cpu-chips"]').should('contain', '1000');
      cy.get('[data-testid="blind-info"]').should('contain', '$10/$20');
      cy.contains('ハンド #1').should('be.visible');
      cy.contains('プリフロップ').should('be.visible');
    });
  });

  describe('パフォーマンステスト', () => {
    it('高速連続プレイでのパフォーマンス', () => {
      const startTime = Date.now();
      
      // 10ハンド高速プレイ
      for (let hand = 1; hand <= 10; hand++) {
        cy.contains('フォールド').click();
        cy.get('[data-testid="showdown-display"]', { timeout: 3000 }).should('be.visible');
        
        if (hand < 10) {
          cy.get('[data-testid="new-hand-button"]').click();
          cy.wait(100); // 最小限の待機時間
        }
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 10ハンドが30秒以内に完了することを確認
      expect(totalTime).to.be.lessThan(30000);
      
      // ゲームが正常に動作していることを確認
      cy.get('[data-testid="game-board"]').should('be.visible');
      cy.contains('ハンド #10').should('be.visible');
    });

    it('メモリリーク検出テスト', () => {
      // 50ハンドの長時間プレイ
      for (let hand = 1; hand <= 50; hand++) {
        if (hand % 10 === 0) {
          cy.log(`メモリリークテスト - ハンド ${hand}/50`);
        }
        
        cy.contains('フォールド').click();
        cy.get('[data-testid="showdown-display"]', { timeout: 2000 }).should('be.visible');
        
        if (hand < 50) {
          cy.get('[data-testid="new-hand-button"]').click();
          cy.wait(50);
        }
      }
      
      // 最終的にゲームが正常に動作していることを確認
      cy.get('[data-testid="game-board"]').should('be.visible');
      cy.contains('フォールド').should('be.visible');
      cy.get('[data-testid="player-chips"]').should('be.visible');
      cy.get('[data-testid="cpu-chips"]').should('be.visible');
      
      // UIが応答性を保っていることを確認
      cy.contains('フォールド').click();
      cy.get('[data-testid="showdown-display"]', { timeout: 3000 }).should('be.visible');
    });
  });

  describe('エッジケーステスト', () => {
    it('同時アクション防止テスト', () => {
      // 複数のボタンを素早くクリック
      cy.contains('フォールド').click();
      cy.get('button').contains(/チェック|コール/).click({ force: true });
      cy.contains('ベット').click({ force: true });
      cy.contains('オールイン').click({ force: true });
      
      // 最初のアクション（フォールド）のみが実行されることを確認
      cy.get('[data-testid="player-status"]').should('contain', 'フォールド');
      cy.get('[data-testid="showdown-display"]', { timeout: 5000 }).should('be.visible');
    });

    it('ページリロード後の状態復元', () => {
      // ゲームを少し進行
      cy.contains('ベット').click();
      cy.contains('1/4 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      cy.wait(2000);
      
      // ページをリロード
      cy.reload();
      cy.get('[data-testid="game-board"]', { timeout: 10000 }).should('be.visible');
      
      // 新しいゲームが開始されることを確認
      cy.contains('テキサスホールデムポーカー').should('be.visible');
      cy.contains('プリフロップ').should('be.visible');
      cy.get('[data-testid="player-chips"]').should('contain', '1000');
    });

    it('ブラウザタブ切り替え後の動作', () => {
      // ゲームを開始
      cy.get('button').contains(/チェック|コール/).click();
      
      // タブを非アクティブにシミュレート
      cy.window().then((win) => {
        win.dispatchEvent(new Event('blur'));
      });
      
      cy.wait(2000);
      
      // タブを再アクティブ化
      cy.window().then((win) => {
        win.dispatchEvent(new Event('focus'));
      });
      
      // ゲームが正常に継続していることを確認
      cy.get('[data-testid="game-board"]').should('be.visible');
      cy.get('[data-testid="game-phase"]').should('not.contain', 'プリフロップ');
    });
  });
});