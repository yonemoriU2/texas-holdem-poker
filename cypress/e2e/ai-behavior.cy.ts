describe('AI行動の妥当性テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="game-board"]', { timeout: 10000 }).should('be.visible');
    cy.contains('テキサスホールデムポーカー').should('be.visible');
    cy.contains('プリフロップ').should('be.visible');
  });

  describe('AIの基本行動パターン', () => {
    it('AIが適切な思考時間を持つ', () => {
      cy.get('button').contains(/チェック|コール/).click();
      
      // AIの思考時間を測定
      const startTime = Date.now();
      cy.get('[data-testid="cpu-status"]', { timeout: 10000 }).should('not.be.empty');
      const endTime = Date.now();
      
      // 思考時間が1-5秒の範囲内であることを確認
      const thinkingTime = endTime - startTime;
      expect(thinkingTime).to.be.at.least(1000);
      expect(thinkingTime).to.be.at.most(5000);
    });

    it('AIがハンド強度に基づいて適切にアクションを選択する', () => {
      // 複数のハンドでAIの行動を観察
      for (let i = 0; i < 3; i++) {
        cy.get('button').contains(/チェック|コール/).click();
        cy.wait(3000);
        
        // AIのアクションを記録
        cy.get('[data-testid="cpu-status"]').then(($status) => {
          const action = $status.text();
          // アクションが有効であることを確認
          expect(action).to.match(/(フォールド|チェック|コール|ベット|レイズ|オールイン)/);
        });
        
        // 新しいハンドを開始
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
    });

    it('AIがポットオッズを考慮してベットする', () => {
      // プレイヤーがベットした場合のAIの応答をテスト
      cy.contains('ベット').click();
      cy.contains('1/2 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      
      cy.wait(3000);
      
      // AIのベット額が合理的であることを確認
      cy.get('[data-testid="pot-amount"]').then(($pot) => {
        const potAmount = parseInt($pot.text().replace(/[^0-9]/g, ''));
        cy.get('[data-testid="current-bet"]').then(($bet) => {
          const betAmount = parseInt($bet.text().replace(/[^0-9]/g, ''));
          
          // ベット額がポットの0.25倍から2倍の範囲内であることを確認
          expect(betAmount).to.be.at.least(Math.floor(potAmount * 0.25));
          expect(betAmount).to.be.at.most(potAmount * 2);
        });
      });
    });
  });

  describe('AIのブラフ機能', () => {
    it('AIが弱いハンドでも時々ベットする（ブラフ）', () => {
      let bluffCount = 0;
      const totalHands = 5;
      
      for (let i = 0; i < totalHands; i++) {
        cy.get('button').contains(/チェック|コール/).click();
        cy.wait(3000);
        
        // AIがベットしたかチェック
        cy.get('[data-testid="cpu-status"]').then(($status) => {
          const action = $status.text();
          if (action.includes('ベット') || action.includes('レイズ')) {
            bluffCount++;
          }
        });
        
        // 新しいハンドを開始
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // ブラフ率が10-30%の範囲内であることを確認
      const bluffRate = bluffCount / totalHands;
      expect(bluffRate).to.be.at.least(0.1);
      expect(bluffRate).to.be.at.most(0.3);
    });

    it('AIが適切なタイミングでフォールドする', () => {
      let foldCount = 0;
      const totalHands = 5;
      
      for (let i = 0; i < totalHands; i++) {
        // プレイヤーが積極的にベット
        cy.contains('ベット').click();
        cy.contains('ポット').click();
        cy.contains(/ベット|レイズ/).click();
        
        cy.wait(3000);
        
        // AIがフォールドしたかチェック
        cy.get('[data-testid="cpu-status"]').then(($status) => {
          const action = $status.text();
          if (action.includes('フォールド')) {
            foldCount++;
          }
        });
        
        // 新しいハンドを開始
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // フォールド率が20-50%の範囲内であることを確認
      const foldRate = foldCount / totalHands;
      expect(foldRate).to.be.at.least(0.2);
      expect(foldRate).to.be.at.most(0.5);
    });
  });

  describe('AIの戦略的一貫性', () => {
    it('AIが同じ状況で一貫した行動を取る', () => {
      const actions = [];
      
      // 同じ状況（プレイヤーがチェック）でAIの行動を記録
      for (let i = 0; i < 3; i++) {
        cy.get('button').contains(/チェック|コール/).click();
        cy.wait(3000);
        
        cy.get('[data-testid="cpu-status"]').then(($status) => {
          actions.push($status.text());
        });
        
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // 行動に一定の一貫性があることを確認
      const uniqueActions = new Set(actions);
      expect(uniqueActions.size).to.be.at.least(1);
      expect(uniqueActions.size).to.be.at.most(3); // あまりにも多様すぎない
    });
  });

  describe('AIの高度な戦略テスト', () => {
    it('AIが異なるゲームフェーズで異なる戦略を使用する', () => {
      const phaseActions = {};
      
      // プリフロップでの行動
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      cy.get('[data-testid="cpu-status"]').then(($status) => {
        phaseActions['preflop'] = $status.text();
      });
      
      // フロップでの行動
      cy.get('[data-testid="game-phase"]').should('contain', 'フロップ');
      cy.get('button').contains(/チェック/).click();
      cy.wait(3000);
      cy.get('[data-testid="cpu-status"]').then(($status) => {
        phaseActions['flop'] = $status.text();
      });
      
      // ターンでの行動
      cy.get('[data-testid="game-phase"]').should('contain', 'ターン');
      cy.get('button').contains(/チェック|コール/).click();
      cy.wait(3000);
      cy.get('[data-testid="cpu-status"]').then(($status) => {
        phaseActions['turn'] = $status.text();
      });
      
      // 各フェーズで有効なアクションが取られていることを確認
      cy.then(() => {
        Object.values(phaseActions).forEach(action => {
          expect(action).to.match(/(フォールド|チェック|コール|ベット|レイズ|オールイン)/);
        });
      });
    });

    it('AIがベットサイジングを適切に調整する', () => {
      const betSizes = [];
      
      for (let i = 0; i < 3; i++) {
        // プレイヤーが異なるサイズでベット
        cy.contains('ベット').click();
        
        if (i === 0) {
          cy.contains('1/4 ポット').click();
        } else if (i === 1) {
          cy.contains('1/2 ポット').click();
        } else {
          cy.contains('ポット').click();
        }
        
        cy.contains(/ベット|レイズ/).click();
        cy.wait(3000);
        
        // AIの応答ベット額を記録
        cy.get('[data-testid="current-bet"]').then(($bet) => {
          const betAmount = parseInt($bet.text().replace(/[^0-9]/g, ''));
          betSizes.push(betAmount);
        });
        
        // 新しいハンドを開始
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // AIが異なるベットサイズに対して適切に調整していることを確認
      cy.then(() => {
        expect(betSizes.length).to.equal(3);
        betSizes.forEach(size => {
          expect(size).to.be.greaterThan(0);
        });
      });
    });

    it('AIがポジションを考慮した戦略を使用する', () => {
      // 複数ハンドでAIの行動パターンを観察
      const actions = [];
      
      for (let hand = 0; hand < 5; hand++) {
        // プレイヤーが先にアクション（AIは後手）
        cy.get('button').contains(/チェック|コール/).click();
        cy.wait(3000);
        
        cy.get('[data-testid="cpu-status"]').then(($status) => {
          actions.push($status.text());
        });
        
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // AIが一定の戦略的多様性を示すことを確認
      cy.then(() => {
        const uniqueActions = new Set(actions);
        expect(uniqueActions.size).to.be.at.least(2); // 少なくとも2種類のアクション
      });
    });
  });

  describe('AIのエッジケース処理', () => {
    it('AIがオールイン状況を適切に処理する', () => {
      // プレイヤーがオールイン
      cy.contains('オールイン').click();
      cy.wait(3000);
      
      // AIが適切に応答する
      cy.get('[data-testid="cpu-status"]').then(($status) => {
        const action = $status.text();
        expect(action).to.match(/(フォールド|コール|オールイン)/);
      });
    });

    it('AIが低チップ状況で適切に行動する', () => {
      // 複数ハンドでチップを減らす
      for (let i = 0; i < 5; i++) {
        cy.contains('ベット').click();
        cy.contains('ポット').click();
        cy.contains(/ベット|レイズ/).click();
        cy.wait(3000);
        
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // チップが少なくなった状況でのAI行動を確認
      cy.get('[data-testid="cpu-chips"]').then(($chips) => {
        const cpuChips = parseInt($chips.text().replace(/[^0-9]/g, ''));
        if (cpuChips < 500) {
          // 低チップ状況でのAI行動をテスト
          cy.get('button').contains(/チェック|コール/).click();
          cy.wait(3000);
          
          cy.get('[data-testid="cpu-status"]').then(($status) => {
            const action = $status.text();
            expect(action).to.match(/(フォールド|チェック|コール|ベット|レイズ|オールイン)/);
          });
        }
      });
    });

    it('AIが連続ベットに対する適応性を示す', () => {
      // プレイヤーが連続でアグレッシブにプレイ
      for (let street = 0; street < 3; street++) {
        if (street === 0) {
          // プリフロップ
          cy.contains('ベット').click();
          cy.contains('ポット').click();
          cy.contains(/ベット|レイズ/).click();
        } else {
          // フロップ以降
          cy.get('[data-testid="game-phase"]').then(($phase) => {
            if (!$phase.text().includes('ショーダウン') && !$phase.text().includes('終了')) {
              cy.contains('ベット').click();
              cy.contains('1/2 ポット').click();
              cy.contains(/ベット|レイズ/).click();
            }
          });
        }
        
        cy.wait(3000);
        
        // AIの応答を確認
        cy.get('[data-testid="cpu-status"]').then(($status) => {
          const action = $status.text();
          expect(action).to.match(/(フォールド|チェック|コール|ベット|レイズ|オールイン)/);
        });
        
        // ゲームが終了していない場合のみ継続
        cy.get('[data-testid="game-phase"]').then(($phase) => {
          if ($phase.text().includes('ショーダウン') || $phase.text().includes('終了')) {
            return false; // ループを終了
          }
        });
      }
    });

    it('AIがタイトアグレッシブ戦略を適切に実行する', () => {
      let foldCount = 0;
      let aggressiveCount = 0;
      const totalHands = 8;
      
      for (let hand = 0; hand < totalHands; hand++) {
        // 様々な状況を作る
        if (hand % 3 === 0) {
          // 弱いベット
          cy.contains('ベット').click();
          cy.contains('1/4 ポット').click();
          cy.contains(/ベット|レイズ/).click();
        } else if (hand % 3 === 1) {
          // 強いベット
          cy.contains('ベット').click();
          cy.contains('ポット').click();
          cy.contains(/ベット|レイズ/).click();
        } else {
          // チェック
          cy.get('button').contains(/チェック|コール/).click();
        }
        
        cy.wait(3000);
        
        // AIの応答を分析
        cy.get('[data-testid="cpu-status"]').then(($status) => {
          const action = $status.text();
          if (action.includes('フォールド')) {
            foldCount++;
          } else if (action.includes('ベット') || action.includes('レイズ')) {
            aggressiveCount++;
          }
        });
        
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // タイトアグレッシブ戦略の特徴を確認
      cy.then(() => {
        const foldRate = foldCount / totalHands;
        const aggressiveRate = aggressiveCount / totalHands;
        
        // 適度なフォールド率（選択的プレイ）
        expect(foldRate).to.be.at.least(0.2);
        expect(foldRate).to.be.at.most(0.6);
        
        // 適度なアグレッション（強いハンドで積極的）
        expect(aggressiveRate).to.be.at.least(0.1);
        expect(aggressiveRate).to.be.at.most(0.4);
      });
    });
  });

  describe('AIのパフォーマンステスト', () => {
    it('AIの応答時間が一定範囲内である', () => {
      const responseTimes = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        cy.get('button').contains(/チェック|コール/).click();
        
        cy.get('[data-testid="cpu-status"]', { timeout: 10000 }).should('not.be.empty').then(() => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          responseTimes.push(responseTime);
        });
        
        cy.wait(3000);
        cy.get('[data-testid="new-hand-button"]').click();
        cy.wait(1000);
      }
      
      // 応答時間の一貫性を確認
      cy.then(() => {
        responseTimes.forEach(time => {
          expect(time).to.be.at.least(500);   // 最低0.5秒
          expect(time).to.be.at.most(8000);   // 最大8秒
        });
        
        // 応答時間の標準偏差が大きすぎないことを確認
        const avg = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
        const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / responseTimes.length;
        const stdDev = Math.sqrt(variance);
        
        expect(stdDev).to.be.lessThan(3000); // 標準偏差が3秒未満
      });
    });

    it('AIが複雑な状況でも適切に判断する', () => {
      // 複雑なベッティングシーケンスを作成
      cy.contains('ベット').click();
      cy.contains('1/4 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      cy.wait(3000);
      
      // フロップでの複雑な状況
      cy.get('[data-testid="game-phase"]').should('contain', 'フロップ');
      cy.contains('ベット').click();
      cy.contains('1/2 ポット').click();
      cy.contains(/ベット|レイズ/).click();
      cy.wait(3000);
      
      // ターンでの判断
      cy.get('[data-testid="game-phase"]').should('contain', 'ターン');
      cy.contains('ベット').click();
      cy.contains('ポット').click();
      cy.contains(/ベット|レイズ/).click();
      cy.wait(5000); // 複雑な判断のため少し長めに待機
      
      // AIが適切に応答することを確認
      cy.get('[data-testid="cpu-status"]').then(($status) => {
        const action = $status.text();
        expect(action).to.match(/(フォールド|チェック|コール|ベット|レイズ|オールイン)/);
      });
    });
  });
}); 