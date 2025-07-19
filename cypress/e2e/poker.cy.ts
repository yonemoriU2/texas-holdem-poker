describe('Texas Hold\'em Poker E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000); // ページの読み込みを待機
  });

  it('ゲームボードが正しく表示される', () => {
    cy.get('[data-testid="game-board"]', { timeout: 10000 }).should('exist');
    cy.contains('テキサスホールデムポーカー').should('be.visible');
  });

  it('プレイヤーエリアが正しく表示される', () => {
    cy.get('[data-testid="player-area"]', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="cpu-area"]', { timeout: 10000 }).should('exist');
  });

  it('ベッティングアクションが正しく表示される', () => {
    cy.get('[data-testid="betting-actions"]', { timeout: 10000 }).should('exist');
  });

  it('コミュニティエリアが正しく表示される', () => {
    cy.get('[data-testid="community-area"]', { timeout: 10000 }).should('exist');
  });

  it('プリセットボタンが正しく表示される', () => {
    cy.get('[data-testid="betting-actions"]').within(() => {
      cy.contains('1/4').should('exist');
      cy.contains('1/2').should('exist');
      cy.contains('ポット').should('exist');
    });
  });

  it('ベットボタンを押すとスライダーが表示される', () => {
    cy.get('[data-testid="betting-actions"]').within(() => {
      cy.contains('ベット').click();
      cy.get('[data-testid="bet-slider"]', { timeout: 5000 }).should('be.visible');
    });
  });

  it('フォールドボタンが機能する', () => {
    cy.get('[data-testid="betting-actions"]').within(() => {
      cy.contains('フォールド').click();
    });
    // フォールド後の状態確認
    cy.get('[data-testid="player-area"]').should('contain', 'フォールド');
  });

  it('チェックボタンが機能する', () => {
    cy.get('[data-testid="betting-actions"]').within(() => {
      cy.contains('チェック').click();
    });
    // チェック後の状態確認（CPUのターンになる）
    cy.wait(1000);
  });

  it('ゲーム進行が正常に動作する', () => {
    // ゲーム開始時の状態確認
    cy.get('[data-testid="phase-indicator"]').should('contain', 'プリフロップ');
    
    // プレイヤーのアクション
    cy.get('[data-testid="betting-actions"]').within(() => {
      cy.contains('チェック').click();
    });
    
    // CPUのアクションを待つ
    cy.wait(2000);
    
    // フェーズが進行することを確認
    cy.get('[data-testid="phase-indicator"]').should('not.contain', 'プリフロップ');
  });
}); 