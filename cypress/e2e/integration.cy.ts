describe('Texas Hold\'em Poker 統合テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    // ゲームが完全に読み込まれるまで待つ
    cy.get('[data-testid="game-board"]', { timeout: 10000 }).should('be.visible');
    
    // 初期状態の確認
    cy.contains('テキサスホールデムポーカー').should('be.visible');
    cy.contains('プリフロップ').should('be.visible');
  });

  describe('ゲーム初期化', () => {
    it('ゲームが正しく初期化される', () => {
      // ゲームタイトル
      cy.contains('テキサスホールデムポーカー').should('be.visible');
      
      // プレイヤー情報
      cy.get('[data-testid="player-chips"]').should('be.visible');
      cy.get('[data-testid="cpu-chips"]').should('be.visible');
      
      // ゲーム情報
      cy.get('[data-testid="blind-info"]').should('contain', '$10/$20');
      cy.contains('ハンド #').should('be.visible');
      cy.contains('プリフロップ').should('be.visible');
      
      // アクションボタン
      cy.contains('フォールド').should('be.visible');
      cy.get('button').contains(/チェック|コール/).should('be.visible');
      cy.contains('ベット').should('be.visible');
      cy.contains('オールイン').should('be.visible');
    });

    it('初期チップ数が正しく設定される', () => {
      cy.get('[data-testid="player-chips"]').should('contain', '1000');
      cy.get('[data-testid="cpu-chips"]').should('contain', '1000');
    });

    it('初期ブラインドが正しく設定される', () => {
      cy.get('[data-testid="blind-info"]').should('contain', '$10/$20');
    });
  });

  describe('カード配布と表示', () => {
    it('プレイヤーのホールカードが正しく表示される', () => {
      // プレイヤーのカードが表面で表示される
      cy.get('[data-testid="player-cards"]').should('be.visible');
      cy.get('[data-testid="player-cards"] .card').should('have.length', 2);
      cy.get('[data-testid="player-cards"] .card').each(($card) => {
        cy.wrap($card).should('not.have.class', 'card-back');
      });
    });

    it('CPUのホールカードが裏面で表示される', () => {
      // CPUのカードが裏面で表示される
      cy.get('[data-testid="cpu-cards"]').should('be.visible');
      cy.get('[data-testid="cpu-cards"] .card').should('have.length', 2);
      cy.get('[data-testid="cpu-cards"] .card').each(($card) => {
        cy.wrap($card).should('have.class', 'card-back');
      });
    });

    it('コミュニティカードエリアが正しく表示される', () => {
      cy.get('[data-testid="community-cards"]').should('be.visible');
      cy.get('[data-testid="community-cards"] .card-placeholder').should('have.length', 5);
    });
  });

  describe('ベッティングアクション', () => {
    it('フォールドアクションが正しく動作する', () => {
      cy.contains('フォールド').click();
      
      // プレイヤーがフォールド状態になる
      cy.get('[data-testid="player-status"]').should('contain', 'フォールド');
      
      // CPUのターンが開始される
      cy.wait(2000);
      cy.get('[data-testid="game-phase"]').should('not.contain', 'プリフロップ');
    });

    it('チェック/コールアクションが正しく動作する', () => {
      cy.get('button').contains(/チェック|コール/).click();
      
      // CPUのターンが開始される
      cy.wait(2000);
      cy.get('[data-testid="game-phase"]').should('not.contain', 'プリフロップ');
    });

    it('ベットアクションが正しく動作する', () => {
      cy.contains('ベット').click();
      
      // ベット額設定エリアが表示される
      cy.get('[data-testid="betting-actions"]').should('be.visible');
      cy.get('[data-testid="bet-slider"]').should('be.visible');
      
      // プリセットボタンが表示される
      cy.contains('1/4 ポット').should('be.visible');
      cy.contains('1/2 ポット').should('be.visible');
      cy.contains('ポット').should('be.visible');
      
      // ベットを実行
      cy.contains('1/4 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      
      // CPUのターンが開始される
      cy.wait(2000);
    });

    it('オールインアクションが正しく動作する', () => {
      cy.contains('オールイン').click();
      
      // プレイヤーがオールイン状態になる
      cy.get('[data-testid="player-status"]').should('contain', 'オールイン');
      
      // CPUのターンが開始される
      cy.wait(2000);
    });
  });

  describe('ゲームフェーズ進行', () => {
    it('プリフロップからフロップへの進行', () => {
      // プリフロップでアクションを完了
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000); // CPUの思考時間
      
      // フロップフェーズに移行
      cy.get('[data-testid="game-phase"]').should('contain', 'フロップ');
      cy.get('[data-testid="community-cards"] .card').should('have.length', 3);
    });

    it('フロップからターンへの進行', () => {
      // プリフロップを完了
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      
      // フロップでアクションを完了
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      
      // ターンフェーズに移行
      cy.get('[data-testid="game-phase"]').should('contain', 'ターン');
      cy.get('[data-testid="community-cards"] .card').should('have.length', 4);
    });

    it('ターンからリバーへの進行', () => {
      // プリフロップとフロップを完了
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      
      // ターンでアクションを完了
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      
      // リバーフェーズに移行
      cy.get('[data-testid="game-phase"]').should('contain', 'リバー');
      cy.get('[data-testid="community-cards"] .card').should('have.length', 5);
    });
  });

  describe('ショーダウンと勝敗判定', () => {
    it('ショーダウン時の勝者表示', () => {
      // ゲームをショーダウンまで進行
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      
      // ショーダウン表示
      cy.get('[data-testid="showdown-display"]').should('be.visible');
    });

    it('フォールドによる勝利', () => {
      cy.contains('フォールド').click();
      cy.wait(3000);
      
      // フォールドによる勝利表示
      cy.get('[data-testid="showdown-display"]').should('be.visible');
    });
  });

  describe('ゲーム継続機能', () => {
    it('新しいハンド開始', () => {
      // 現在のハンドを完了
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      
      // 新しいハンドを開始
      cy.get('[data-testid="new-hand-button"]').click();
      
      // ゲームがリセットされる
      cy.get('[data-testid="game-phase"]').should('contain', 'プリフロップ');
      cy.get('[data-testid="community-cards"] .card-placeholder').should('have.length', 5);
      cy.get('[data-testid="player-status"]').should('not.contain', 'フォールド');
    });
  });

  describe('AI行動の妥当性', () => {
    it('AIが適切なタイミングでアクションを実行する', () => {
      // プレイヤーのアクション後、AIが一定時間後にアクションを実行
      cy.get('button').contains(/チェック|コール/).click();
      
      // AIの思考時間を待つ
      cy.wait(2000);
      
      // AIがアクションを実行したことを確認
      cy.get('[data-testid="cpu-status"]').should('not.be.empty');
    });

    it('AIのベット額が妥当な範囲内である', () => {
      // プレイヤーがベットした場合のAIの応答
      cy.contains('ベット').click();
      cy.contains('1/4 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      
      cy.wait(3000);
      
      // AIのベット額が妥当であることを確認
      cy.get('[data-testid="pot-amount"]').then(($pot) => {
        const potAmount = parseInt($pot.text().replace(/[^0-9]/g, ''));
        cy.get('[data-testid="current-bet"]').then(($bet) => {
          const betAmount = parseInt($bet.text().replace(/[^0-9]/g, ''));
          expect(betAmount).to.be.at.least(0);
          expect(betAmount).to.be.at.most(potAmount * 2); // 合理的な上限
        });
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なアクションが適切に処理される', () => {
      // プレイヤーがフォールドした後、アクションボタンが無効になる
      cy.contains('フォールド').click();
      
      // アクションボタンが無効になる
      cy.get('button').contains('フォールド').should('be.disabled');
      cy.get('button').contains(/チェック|コール/).should('be.disabled');
      cy.get('button').contains('ベット').should('be.disabled');
      cy.get('button').contains('オールイン').should('be.disabled');
    });

    it('ゲーム状態の整合性が保たれる', () => {
      // ゲーム進行中に状態が矛盾しないことを確認
      cy.get('[data-testid="player-chips"]').then(($chips) => {
        const initialChips = parseInt($chips.text().replace(/[^0-9]/g, ''));
        
        cy.contains('ベット').click();
        cy.contains('1/4 ポット').click();
        cy.contains(/ベット|レイズ/).click();
        
        cy.wait(1000);
        
        cy.get('[data-testid="player-chips"]').then(($newChips) => {
          const newChips = parseInt($newChips.text().replace(/[^0-9]/g, ''));
          expect(newChips).to.be.lessThan(initialChips);
        });
      });
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル表示でUIが適切に表示される', () => {
      cy.viewport(375, 667); // iPhone SE
      
      // モバイルでも主要な要素が表示される
      cy.contains('テキサスホールデムポーカー').should('be.visible');
      cy.contains('フォールド').should('be.visible');
      cy.get('button').contains(/チェック|コール/).should('be.visible');
    });

    it('タブレット表示でUIが適切に表示される', () => {
      cy.viewport(768, 1024); // iPad
      
      // タブレットでも主要な要素が表示される
      cy.contains('テキサスホールデムポーカー').should('be.visible');
      cy.get('[data-testid="game-board"]').should('be.visible');
    });
  });
}); 