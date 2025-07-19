describe('デバッグテスト', () => {
  beforeEach(() => {
    // 正しいベースパスでアクセス
    cy.visit('/');
    cy.wait(2000); // ページの読み込みを待機
  });

  it('ページが正常に読み込まれる', () => {
    // ページのタイトルを確認
    cy.title().then((title) => {
      cy.log(`ページタイトル: ${title}`);
    });

    // ページのHTMLを確認
    cy.get('html').then(($html) => {
      cy.log(`HTML要素数: ${$html.find('*').length}`);
    });

    // ページのURLを確認
    cy.url().then((url) => {
      cy.log(`現在のURL: ${url}`);
    });

    // ページの読み込み状態を確認
    cy.window().then((win) => {
      cy.log(`document.readyState: ${win.document.readyState}`);
    });
  });

  it('ゲームボード要素の存在確認', () => {
    // ゲームボード要素を探す
    cy.get('[data-testid="game-board"]', { timeout: 10000 }).should('exist');
    
    // ゲームボードの内容を確認
    cy.get('[data-testid="game-board"]').then(($board) => {
      cy.log(`ゲームボード要素のクラス: ${$board.attr('class')}`);
      cy.log(`ゲームボードの子要素数: ${$board.children().length}`);
    });
  });

  it('タイトルテキストの確認', () => {
    // タイトルテキストを探す（複数の方法で）
    cy.contains('テキサスホールデムポーカー', { timeout: 10000 }).should('exist');
    
    // または h1 要素で探す
    cy.get('h1').contains('テキサスホールデムポーカー').should('exist');
  });

  it('プレイヤーエリアの確認', () => {
    // プレイヤーエリアの存在確認
    cy.get('[data-testid="player-area"]', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="cpu-area"]', { timeout: 10000 }).should('exist');
  });

  it('ベッティングアクションの確認', () => {
    // ベッティングアクションエリアの存在確認
    cy.get('[data-testid="betting-actions"]', { timeout: 10000 }).should('exist');
  });

  it('コミュニティエリアの確認', () => {
    // コミュニティエリアの存在確認
    cy.get('[data-testid="community-area"]', { timeout: 10000 }).should('exist');
  });
}); 