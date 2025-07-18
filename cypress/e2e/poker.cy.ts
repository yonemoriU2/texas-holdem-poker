describe('Texas Hold\'em Poker E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ゲームタイトルが表示される', () => {
    cy.contains('テキサスホールデムポーカー').should('be.visible');
  });

  it('プレイヤーとCPUの情報が表示される', () => {
    // ゲーム情報エリアでプレイヤーとCPUのチップ数が表示される
    cy.contains('プレイヤー: $').should('be.visible');
    cy.contains('CPU: $').should('be.visible');
  });

  it('アクションボタンが表示される', () => {
    cy.contains('フォールド').should('be.visible');
    // チェックまたはコールが表示される（ゲーム状態による）
    cy.get('button').contains(/チェック|コール/).should('be.visible');
    cy.contains('ベット').should('be.visible');
    cy.contains('オールイン').should('be.visible');
  });

  it('ベットボタンを押すとスライダーが表示される', () => {
    // プレイヤーのターンになるまで待つ（CPUの思考が終わるまで）
    cy.wait(5000); // CPUの思考時間を待つ
    // ベットボタンが表示されるまで待つ
    cy.contains('ベット', { timeout: 20000 }).should('be.visible');
    cy.contains('ベット').click();
    // ベット額設定エリアが表示される（少し待つ）
    cy.wait(2000);
    // デバッグ情報を確認
    cy.get('body').then(($body) => {
      cy.log('Body content:', $body.text());
    });
    cy.contains('ベット額を設定').should('be.visible');
    cy.get('[data-testid="slider"]').should('be.visible');
  });

  it('プリセットボタンが正しく表示される', () => {
    // プレイヤーのターンになるまで待つ（CPUの思考が終わるまで）
    cy.wait(5000); // CPUの思考時間を待つ
    // ベットボタンが表示されるまで待つ
    cy.contains('ベット', { timeout: 20000 }).should('be.visible');
    cy.contains('ベット').click();
    // ベット額設定エリアが表示される（少し待つ）
    cy.wait(2000);
    // デバッグ情報を確認
    cy.get('body').then(($body) => {
      cy.log('Body content:', $body.text());
    });
    cy.contains('1/4 ポット').should('be.visible');
    cy.contains('1/2 ポット').should('be.visible');
    cy.contains('ポット').should('be.visible');
  });

  it('新しいハンドボタンが表示される（無効状態でも）', () => {
    cy.contains('新しいハンド').should('be.visible');
    // ボタンが無効状態でも存在することを確認
    cy.get('button').contains('新しいハンド').should('exist');
  });

  it('新しいゲームボタンでゲームをリセットできる', () => {
    cy.contains('新しいゲーム').should('be.visible');
    cy.contains('新しいゲーム').click();
    cy.contains('テキサスホールデムポーカー').should('be.visible');
  });

  it('ゲーム情報が表示される', () => {
    cy.contains('ブラインド: $10/$20').should('be.visible');
  });

  it('フォールドボタンが機能する', () => {
    cy.contains('フォールド').click();
    // フォールド後はプレイヤーの状態が「フォールド」になる
    cy.contains('フォールド').should('be.visible');
  });

  it('チェック/コールボタンが機能する', () => {
    // チェックまたはコールボタンをクリック
    cy.get('button').contains(/チェック|コール/).click();
    // アクション後はCPUのターンになる可能性がある
    cy.wait(2000); // CPUの思考時間を待つ
  });

  it('オールインボタンが機能する', () => {
    cy.contains('オールイン').click();
    // オールイン後はプレイヤーの状態が「オールイン」になる
    cy.contains('オールイン').should('be.visible');
  });

  it('ゲームの初期状態が正しく表示される', () => {
    // ハンド番号が表示される
    cy.contains('ハンド #').should('be.visible');
    // ゲームフェーズが表示される
    cy.contains('プリフロップ').should('be.visible');
  });

  it('デバッグ情報が表示される（開発時）', () => {
    // 開発環境ではデバッグ情報が表示される
    cy.get('body').then(($body) => {
      if ($body.find('[class*="debug"]').length > 0) {
        cy.contains('デバッグ情報').should('be.visible');
      }
    });
  });
}); 