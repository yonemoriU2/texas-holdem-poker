import { useContext, useEffect, useState, useRef } from 'react';
import { GameContext } from '../../context/GameContext';
import PlayerArea from '../Player/PlayerArea';
import CommunityArea from '../Community/CommunityArea';
import BettingActions from '../BettingActions/BettingActions';
import PhaseIndicator from './PhaseIndicator';
import TurnIndicator from './TurnIndicator';
import PhaseTransition from './PhaseTransition';
import BlindManager from './BlindManager';
import ShowdownDisplay from './ShowdownDisplay';
import GameContinuation from './GameContinuation';
import ErrorDisplay from '../UI/ErrorDisplay';
import { Button, ChipPileAnimation } from '../UI';
import type { GamePhase } from '../../types';

export default function GameBoard() {
  const { state, actions, errors } = useContext(GameContext)!;
  const [previousPhase, setPreviousPhase] = useState<GamePhase>('preflop');
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [showShowdown, setShowShowdown] = useState(false);
  const [showChipAnimation, setShowChipAnimation] = useState(false);
  const [dealAnimation, setDealAnimation] = useState(false);
  const [flipAnimation, setFlipAnimation] = useState(false);
  const [chipAnimationData, setChipAnimationData] = useState<{
    fromPosition: { x: number; y: number };
    toPosition: { x: number; y: number };
    amount: number;
  } | null>(null);
  const potRef = useRef<HTMLDivElement>(null);
  const playerAreaRef = useRef<HTMLDivElement>(null);
  const cpuAreaRef = useRef<HTMLDivElement>(null);

  // ゲーム開始時の初期化
  useEffect(() => {
    if (!state.isGameActive) {
      actions.startGame();
      actions.dealCards();
      // カード配布アニメーションを開始
      setDealAnimation(true);
      setTimeout(() => setDealAnimation(false), 2000);
    }
  }, [actions, state.isGameActive]);

  // フェーズ遷移の監視
  useEffect(() => {
    if (previousPhase !== state.gamePhase) {
      setShowPhaseTransition(true);
      setPreviousPhase(state.gamePhase);
      
      // フェーズ遷移時にフリップアニメーションを開始
      if (state.gamePhase === 'flop' || state.gamePhase === 'turn' || state.gamePhase === 'river') {
        setFlipAnimation(true);
        setTimeout(() => setFlipAnimation(false), 1000);
      }
    }
  }, [state.gamePhase, previousPhase]);

  // ショーダウン表示の制御
  useEffect(() => {
    if (state.gamePhase === 'showdown' && state.winner && !showShowdown) {
      // ショーダウン表示を少し遅延
      const timer = setTimeout(() => {
        setShowShowdown(true);
        // ショーダウン時にフリップアニメーションを開始
        setFlipAnimation(true);
        setTimeout(() => setFlipAnimation(false), 1000);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.gamePhase, state.winner, showShowdown]);

  // チップアニメーションの制御
  useEffect(() => {
    if (state.gamePhase === 'showdown' && state.winner && !showChipAnimation) {
      // ポットから勝者へのチップ移動アニメーション
      const timer = setTimeout(() => {
        if (potRef.current && (playerAreaRef.current || cpuAreaRef.current)) {
          const potRect = potRef.current.getBoundingClientRect();
          const targetRef = state.winner === 'player' ? playerAreaRef : cpuAreaRef;
          const targetRect = targetRef.current?.getBoundingClientRect();
          
          if (targetRect) {
            setChipAnimationData({
              fromPosition: {
                x: potRect.left + potRect.width / 2,
                y: potRect.top + potRect.height / 2
              },
              toPosition: {
                x: targetRect.left + targetRect.width / 2,
                y: targetRect.top + targetRect.height / 2
              },
              amount: state.pot
            });
            setShowChipAnimation(true);
          }
        }
      }, 2000); // ショーダウン表示の後に開始
      
      return () => clearTimeout(timer);
    }
  }, [state.gamePhase, state.winner, state.pot, showChipAnimation]);

  // ゲーム終了チェック
  useEffect(() => {
    if (state.gamePhase === 'ended' || state.gamePhase === 'showdown') {
      actions.checkGameOver();
    }
  }, [state.gamePhase, state.players, actions]);

  const handleNewHand = () => {
    actions.newHand();
    actions.startGame();
    actions.dealCards();
    setShowShowdown(false);
    setShowChipAnimation(false);
    setChipAnimationData(null);
    // 新しいハンド開始時にカード配布アニメーションを開始
    setDealAnimation(true);
    setTimeout(() => setDealAnimation(false), 2000);
  };

  const handleNewGame = () => {
    actions.startNewGame();
    actions.startGame();
    actions.dealCards();
    setShowShowdown(false);
    setShowChipAnimation(false);
    setChipAnimationData(null);
    // 新しいゲーム開始時にカード配布アニメーションを開始
    setDealAnimation(true);
    setTimeout(() => setDealAnimation(false), 2000);
  };

  const handleShowdownContinue = () => {
    setShowShowdown(false);
    // ポット分配を実行
    actions.distributePot();
  };

  const handleChipAnimationComplete = () => {
    setShowChipAnimation(false);
    setChipAnimationData(null);
  };

  const isPlayerTurn = state.activePlayerIndex === 0 && 
    !state.players[0].hasFolded && 
    !state.players[0].isAllIn;

  const isShowdown = state.gamePhase === 'showdown';
  const isGameEnded = state.gamePhase === 'ended';
  const showGameContinuation = isShowdown || isGameEnded || state.isGameOver;

  const handlePhaseTransitionComplete = () => {
    setShowPhaseTransition(false);
  };

  // エラーハンドリング
  const handleValidateState = () => {
    actions.validateState();
  };

  const handleRepairState = () => {
    actions.repairState();
  };

  const handleDismissError = (errorIndex: number) => {
    actions.dismissError(errorIndex);
  };

  // デバッグ情報
  const debugInfo = {
    activePlayer: state.players[state.activePlayerIndex]?.name,
    gamePhase: state.gamePhase,
    pot: state.pot,
    currentBet: state.currentBet,
    playerChips: state.players[0].chips,
    cpuChips: state.players[1].chips,
    playerBet: state.players[0].currentBet,
    cpuBet: state.players[1].currentBet,
    playerFolded: state.players[0].hasFolded,
    cpuFolded: state.players[1].hasFolded
  };

  return (
    <div data-testid="game-board" className="h-screen w-screen bg-poker-dark text-poker-text flex flex-col overflow-hidden">
      {/* フェーズ遷移アニメーション */}
      {showPhaseTransition && (
        <PhaseTransition
          fromPhase={previousPhase}
          toPhase={state.gamePhase}
          onComplete={handlePhaseTransitionComplete}
        />
      )}

      {/* エラー表示エリア */}
      {errors.length > 0 && (
        <div className="absolute top-4 left-4 right-4 z-50 space-y-2">
          {errors.map((error, index) => (
            <ErrorDisplay
              key={`${error.timestamp}-${index}`}
              error={error}
              onDismiss={() => handleDismissError(index)}
              onRepair={handleRepairState}
              className="w-full"
            />
          ))}
        </div>
      )}

      {/* ヘッダー - コンパクト */}
      <div className="bg-poker-gray/80 backdrop-blur-sm px-4 py-2 border-b border-poker-border">
        <div className="flex justify-between items-center">
          <div className="text-poker-text text-sm font-medium">
            ハンド #{state.handNumber}
          </div>
          <div className="text-poker-accent text-sm font-semibold">
            {getPhaseDisplayName(state.gamePhase)}
          </div>
          <div className="text-poker-text-secondary text-xs">
            {debugInfo.activePlayer && `${debugInfo.activePlayer}のターン`}
          </div>
        </div>
        
        {/* エラーハンドリングボタン（開発モードのみ） */}
        {import.meta.env.DEV && (
          <div className="mt-2 flex gap-2 justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleValidateState}
            >
              状態検証
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRepairState}
            >
              自動修復
            </Button>
          </div>
        )}
      </div>

      {/* メインゲームエリア - モバイル縦向きレイアウト */}
      <div className="flex-1 flex flex-col">
        
        {/* CPU プレイヤーエリア（上部） */}
        <div className="bg-poker-gray/30 p-3 border-b border-poker-border" ref={cpuAreaRef}>
          <PlayerArea
            player={state.players[1]}
            isActive={state.activePlayerIndex === 1}
            showCards={isShowdown || isGameEnded}
            className="scale-90 origin-center"
            dealAnimation={dealAnimation}
            flipAnimation={flipAnimation}
          />
        </div>

        {/* コミュニティエリア（中央） */}
        <div className="flex-1 flex flex-col justify-center bg-poker-dark p-4" ref={potRef}>
          <CommunityArea
            communityCards={state.communityCards}
            gamePhase={state.gamePhase}
            pot={state.pot}
            currentBet={state.currentBet}
          />
          
          {/* ゲーム進行情報 - コンパクト表示 */}
          <div className="mt-4 flex justify-center space-x-4 text-xs text-poker-text-secondary">
            <div data-testid="player-chips">プレイヤー: ${state.players[0].chips.toLocaleString()}</div>
            <div data-testid="cpu-chips">CPU: ${state.players[1].chips.toLocaleString()}</div>
            <div data-testid="blind-info">ブラインド: ${state.smallBlind}/${state.bigBlind}</div>
          </div>
        </div>

        {/* プレイヤーエリア（下部） */}
        <div className="bg-poker-gray/30 p-3 border-t border-poker-border" ref={playerAreaRef}>
          <PlayerArea
            player={state.players[0]}
            isActive={state.activePlayerIndex === 0}
            showCards={true}
            className="scale-90 origin-center"
            dealAnimation={dealAnimation}
            flipAnimation={flipAnimation}
          />
        </div>

        {/* アクションエリア（最下部） */}
        <div className="bg-poker-gray border-t border-poker-border p-4">
          {isPlayerTurn && !isShowdown && !isGameEnded ? (
            <BettingActions className="w-full" />
          ) : (
            <div className="text-center py-4">
              <div className="text-poker-text text-base animate-pulse">
                {isShowdown ? 'ショーダウン中...' : 
                 isGameEnded ? 'ゲーム終了' : 
                 state.activePlayerIndex === 1 ? 'CPUの思考中...' : '待機中...'}
              </div>
            </div>
          )}
        </div>

        {/* 勝者表示（オーバーレイ） */}
        {state.winner && !showShowdown && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-poker-accent/90 backdrop-blur-sm rounded-lg p-6 mx-4 border-2 border-poker-accent animate-fade-in-up">
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                🏆 勝者: {state.players.find(p => p.id === state.winner)?.name}
              </h3>
              {state.winningHand && (
                <p className="text-white/90 font-semibold text-center">
                  ハンド: {state.winningHand.name}
                </p>
              )}
              <p className="text-white/90 text-center">
                獲得ポット: ${state.pot.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* ゲーム継続機能（オーバーレイ） */}
        {showGameContinuation && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="mx-4 animate-fade-in-up">
              <GameContinuation
                gameState={state}
                onNewHand={handleNewHand}
                onNewGame={handleNewGame}
              />
            </div>
          </div>
        )}

        {/* デバッグ情報（開発時のみ表示） */}
        {import.meta.env.DEV && (
          <div className="absolute bottom-20 left-2 right-2 p-2 bg-poker-gray/90 rounded-lg text-xs text-poker-text-secondary z-30">
            <h4 className="font-bold mb-1">デバッグ情報:</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div data-testid="game-phase">フェーズ: {debugInfo.gamePhase}</div>
              <div data-testid="pot-amount">ポット: ${debugInfo.pot}</div>
              <div data-testid="current-bet">現在のベット: ${debugInfo.currentBet}</div>
              <div>プレイヤーベット: ${debugInfo.playerBet}</div>
              <div>CPUベット: ${debugInfo.cpuBet}</div>
              <div>プレイヤーフォールド: {debugInfo.playerFolded ? 'Yes' : 'No'}</div>
              <div>CPUフォールド: {debugInfo.cpuFolded ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* ショーダウン表示（オーバーレイ） */}
        {showShowdown && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <ShowdownDisplay
              gameState={state}
              onContinue={handleShowdownContinue}
            />
          </div>
        )}

        {/* チップアニメーション */}
        {showChipAnimation && chipAnimationData && (
          <ChipPileAnimation
            fromPosition={chipAnimationData.fromPosition}
            toPosition={chipAnimationData.toPosition}
            amount={chipAnimationData.amount}
            onComplete={handleChipAnimationComplete}
          />
        )}
      </div>
    </div>
  );
}

/**
 * ゲームフェーズの表示名を取得
 */
function getPhaseDisplayName(phase: GamePhase): string {
  const phaseNames = {
    preflop: 'プリフロップ',
    flop: 'フロップ',
    turn: 'ターン',
    river: 'リバー',
    showdown: 'ショーダウン',
    ended: '終了'
  };
  return phaseNames[phase];
}