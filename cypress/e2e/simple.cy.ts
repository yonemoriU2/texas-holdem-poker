describe('Simple E2E Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ページが読み込まれる', () => {
    cy.get('body').should('be.visible');
  });

  it('ゲームタイトルが表示される', () => {
    cy.contains('テキサスホールデムポーカー').should('be.visible');
  });

  it('ゲームボードが表示される', () => {
    cy.get('[data-testid="game-board"]').should('be.visible');
  });

  it('プレイヤー情報が表示される', () => {
    cy.get('[data-testid="player-chips"]').should('be.visible');
    cy.get('[data-testid="cpu-chips"]').should('be.visible');
  });
}); 