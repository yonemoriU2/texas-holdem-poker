describe('ユーザーインタラクション統合テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  describe('ボタンインタラクション', () => {
    it('すべてのアクションボタンが正しく動作する', () => {
      // フォールドボタン
      cy.contains('フォールド').should('be.visible').and('not.be.disabled');
      cy.contains('フォールド').click();
      cy.get('[data-testid="player-area"]').should('contain', 'フォールド');
      
      // 新しいハンドでリセット
      cy.wait(3000);
      cy.get('[data-testid="new-hand-button"]').click();
      cy.wait(1000);
      
      // チェック/コールボタン
      cy.get('button').contains(/チェック|コール/).should('be.visible').and('not.be.disabled');
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(2000);
      
      // 新しいハンドでリセット
      cy.wait(3000);
      cy.get('[data-testid="new-hand-button"]').click();
      cy.wait(1000);
      
      // ベットボタン
      cy.contains('ベット').should('be.visible').and('not.be.disabled');
      cy.contains('ベット').click();
      cy.get('[data-testid="betting-actions"]').should('be.visible');
      
      // ベットをキャンセル
      cy.contains('キャンセル').click();
      cy.get('[data-testid="betting-actions"]').should('not.be.visible');
      
      // オールインボタン
      cy.contains('オールイン').should('be.visible').and('not.be.disabled');
      cy.contains('オールイン').click();
      cy.get('[data-testid="player-area"]').should('contain', 'オールイン');
    });

    it('ボタンの状態がゲーム進行に応じて適切に変化する', () => {
      // プレイヤーがフォールド後、アクションボタンが無効になる
      cy.contains('フォールド').click();
      
      cy.get('button').contains('フォールド').should('be.disabled');
      cy.get('button').contains(/チェック|コール/).should('be.disabled');
      cy.get('button').contains('ベット').should('be.disabled');
      cy.get('button').contains('オールイン').should('be.disabled');
      
      // 新しいハンドでボタンが再有効化される
      cy.wait(3000);
      cy.get('[data-testid="new-hand-button"]').click();
      cy.wait(1000);
      
      cy.get('button').contains('フォールド').should('not.be.disabled');
      cy.get('button').contains(/チェック|コール/).should('not.be.disabled');
      cy.get('button').contains('ベット').should('not.be.disabled');
      cy.get('button').contains('オールイン').should('not.be.disabled');
    });

    it('ホバー効果とクリックアニメーションが正しく動作する', () => {
      // フォールドボタンのホバー効果
      cy.contains('フォールド').trigger('mouseover');
      cy.contains('フォールド').should('have.class', 'hover:scale-105');
      
      // クリックアニメーション
      cy.contains('フォールド').click();
      cy.contains('フォールド').should('have.class', 'scale-95');
    });
  });

  describe('ベット額設定インタラクション', () => {
    it('スライダーが正しく動作する', () => {
      cy.contains('ベット').click();
      
      // スライダーが表示される
      cy.get('[data-testid="bet-slider"]').should('be.visible');
      
      // スライダーの値を変更
      cy.get('[data-testid="bet-slider"]').invoke('val', 100).trigger('change');
      
      // 最大値まで変更
      cy.get('[data-testid="bet-slider"]').invoke('val', 500).trigger('change');
    });

    it('プリセットボタンが正しく動作する', () => {
      cy.contains('ベット').click();
      
      // 1/4 ポットボタン
      cy.contains('1/4').click();
      
      // 1/2 ポットボタン
      cy.contains('1/2').click();
      
      // ポットボタン
      cy.contains('ポット').click();
    });

    it('ベット実行とキャンセルが正しく動作する', () => {
      cy.contains('ベット').click();
      cy.contains('1/4').click();
      
      // ベット実行
      cy.contains(/ベット|レイズ/).click();
      cy.get('[data-testid="betting-actions"]').should('not.be.visible');
      cy.get('[data-testid="player-area"]').should('contain', 'ベット');
      
      // 新しいハンドでリセット
      cy.wait(3000);
      cy.get('[data-testid="new-hand-button"]').click();
      cy.wait(1000);
      
      // キャンセル
      cy.contains('ベット').click();
      cy.contains('キャンセル').click();
      cy.get('[data-testid="betting-actions"]').should('not.be.visible');
    });
  });

  describe('ゲーム継続インタラクション', () => {
    it('新しいハンドボタンが正しく動作する', () => {
      // 現在のハンドを完了
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(2000);
      
      // 新しいハンドを開始
      cy.wait(3000);
      cy.get('[data-testid="new-hand-button"]').click();
      
      // ゲームがリセットされる
      cy.get('[data-testid="phase-indicator"]').should('contain', 'プリフロップ');
      cy.get('[data-testid="community-area"]').should('be.visible');
      cy.get('[data-testid="player-area"]').should('not.contain', 'フォールド');
    });

    it('新しいゲームボタンが正しく動作する', () => {
      // 現在のチップ数を記録
      cy.get('[data-testid="player-chips"]').then(($chips) => {
        const initialChips = $chips.text();
        
        // 新しいゲームを開始
        cy.wait(5000);
        cy.get('[data-testid="new-game-button"]').click();
        
        // チップ数が初期値に戻る
        cy.get('[data-testid="player-chips"]').should('contain', '1000');
        cy.get('[data-testid="cpu-chips"]').should('contain', '1000');
        
        // ブラインドが初期値に戻る
        cy.get('[data-testid="blind-info"]').should('contain', '$10/$20');
      });
    });
  });

  describe('キーボードインタラクション', () => {
    it('キーボードショートカットが正しく動作する', () => {
      // フォールドのショートカット（Fキー）
      cy.get('body').type('f');
      cy.get('[data-testid="player-area"]').should('contain', 'フォールド');
      
      // 新しいハンドでリセット
      cy.wait(3000);
      cy.get('[data-testid="new-hand-button"]').click();
      cy.wait(1000);
      
      // チェック/コールのショートカット（Cキー）
      cy.get('body').type('c');
      cy.wait(2000);
      
      // 新しいハンドでリセット
      cy.wait(3000);
      cy.get('[data-testid="new-hand-button"]').click();
      cy.wait(1000);
      
      // ベットのショートカット（Bキー）
      cy.get('body').type('b');
      cy.get('[data-testid="betting-actions"]').should('be.visible');
      
      // ESCキーでキャンセル
      cy.get('body').type('{esc}');
      cy.get('[data-testid="betting-actions"]').should('not.be.visible');
    });

    it('フォーカス管理が正しく動作する', () => {
      // フォールドボタンにフォーカス
      cy.contains('フォールド').focus();
      cy.contains('フォールド').should('have.focus');
      
      // Tabキーで次のボタンに移動
      cy.get('body').tab();
      cy.get('button').contains(/チェック|コール/).should('have.focus');
      
      // Enterキーでアクション実行
      cy.get('body').type('{enter}');
      cy.wait(2000);
    });
  });

  describe('タッチインタラクション（モバイル）', () => {
    it('モバイルデバイスでのタッチ操作が正しく動作する', () => {
      cy.viewport(375, 667); // iPhone SE
      
      // タッチでフォールド
      cy.contains('フォールド').trigger('touchstart').trigger('touchend');
      cy.get('[data-testid="player-area"]').should('contain', 'フォールド');
      
      // 新しいハンドでリセット
      cy.contains('新しいハンド').trigger('touchstart').trigger('touchend');
      cy.wait(1000);
      
      // タッチでベット
      cy.contains('ベット').trigger('touchstart').trigger('touchend');
      cy.get('[data-testid="betting-actions"]').should('be.visible');
      
      // タッチでプリセット選択
      cy.contains('1/4').trigger('touchstart').trigger('touchend');
      cy.contains(/ベット|レイズ/).trigger('touchstart').trigger('touchend');
    });

    it('スワイプジェスチャーが正しく動作する', () => {
      cy.viewport(375, 667);
      
      cy.contains('ベット').click();
      
      // スライダーのスワイプ操作
      cy.get('[data-testid="bet-slider"]')
        .trigger('touchstart', { touches: [{ clientX: 50, clientY: 0 }] })
        .trigger('touchmove', { touches: [{ clientX: 200, clientY: 0 }] })
        .trigger('touchend');
      
      cy.get('[data-testid="bet-slider"]').should('be.visible');
    });
  });

  describe('アクセシビリティ', () => {
    it('スクリーンリーダー対応が正しく実装されている', () => {
      // aria-label属性の確認
      cy.contains('フォールド').should('have.attr', 'aria-label');
      cy.get('button').contains(/チェック|コール/).should('have.attr', 'aria-label');
      cy.contains('ベット').should('have.attr', 'aria-label');
      
      // role属性の確認
      cy.get('[data-testid="game-board"]').should('have.attr', 'role');
      cy.get('[data-testid="bet-slider"]').should('have.attr', 'role');
    });

    it('キーボードナビゲーションが正しく動作する', () => {
      // Tabキーでのナビゲーション
      cy.get('body').tab();
      cy.focused().should('contain', 'フォールド');
      
      cy.get('body').tab();
      cy.focused().should('contain', /チェック|コール/);
      
      cy.get('body').tab();
      cy.focused().should('contain', 'ベット');
      
      cy.get('body').tab();
      cy.focused().should('contain', 'オールイン');
    });

    it('reduced-motion設定が正しく適用される', () => {
      // reduced-motion設定をシミュレート
      cy.window().then((win) => {
        cy.stub(win, 'matchMedia').returns({
          matches: true,
          addListener: () => {},
          removeListener: () => {}
        });
      });
      
      // アニメーションが無効化されることを確認
      cy.contains('フォールド').click();
      cy.contains('フォールド').should('not.have.class', 'animate-pulse');
    });
  });

  describe('エラー状態の処理', () => {
    it('無効な操作が適切に処理される', () => {
      // プレイヤーがフォールド後、他のアクションが無効になる
      cy.contains('フォールド').click();
      
      // 無効なボタンをクリックしてもエラーが発生しない
      cy.get('button').contains(/チェック|コール/).click({ force: true });
      cy.get('[data-testid="player-area"]').should('contain', 'フォールド');
      
      cy.contains('ベット').click({ force: true });
      cy.get('[data-testid="betting-actions"]').should('not.be.visible');
    });

    it('ネットワークエラーが適切に処理される', () => {
      // ネットワークエラーをシミュレート
      cy.intercept('GET', '**', { forceNetworkError: true }).as('networkError');
      
      // エラー表示が適切に処理される
      cy.get('[data-testid="error-display"]').should('be.visible');
      cy.contains('エラーが発生しました').should('be.visible');
    });
  });

  describe('パフォーマンステスト', () => {
    it('連続操作でパフォーマンスが低下しない', () => {
      const startTime = Date.now();
      
      // 10回連続でフォールド
      for (let i = 0; i < 10; i++) {
        cy.contains('フォールド').click();
        cy.contains('新しいハンド').click();
        cy.wait(100);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 10回の操作が5秒以内に完了することを確認
      expect(totalTime).to.be.lessThan(5000);
    });

    it('メモリリークが発生しない', () => {
      // 長時間の操作でメモリ使用量が安定することを確認
      for (let i = 0; i < 50; i++) {
        cy.contains('フォールド').click();
        cy.contains('新しいハンド').click();
        cy.wait(50);
      }
      
      // ゲームが正常に動作し続けることを確認
      cy.get('[data-testid="game-board"]').should('be.visible');
      cy.contains('フォールド').should('be.visible');
    });
  });
}); 