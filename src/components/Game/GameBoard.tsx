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
import { Button, ChipPileAnimation } from '../UI';
import type { GamePhase } from '../../types';

export default function GameBoard() {
  const { state, actions } = useContext(GameContext)!;
  const [previousPhase, setPreviousPhase] = useState<GamePhase>('preflop');
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [showShowdown, setShowShowdown] = useState(false);
  const [showChipAnimation, setShowChipAnimation] = useState(false);
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
    }
  }, [actions, state.isGameActive]);

  // フェーズ遷移の監視
  useEffect(() => {
    if (previousPhase !== state.gamePhase) {
      setShowPhaseTransition(true);
      setPreviousPhase(state.gamePhase);
    }
  }, [state.gamePhase, previousPhase]);

  // ショーダウン表示の制御
  useEffect(() => {
    if (state.gamePhase === 'showdown' && state.winner && !showShowdown) {
      // ショーダウン表示を少し遅延
      const timer = setTimeout(() => {
        setShowShowdown(true);
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

  const handleNewHand = () => {
    actions.newHand();
    actions.dealCards();
    setShowShowdown(false);
    setShowChipAnimation(false);
    setChipAnimationData(null);
  };

  const handleNewGame = () => {
    actions.resetGame();
    actions.startGame();
    actions.dealCards();
    setShowShowdown(false);
    setShowChipAnimation(false);
    setChipAnimationData(null);
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

  const handlePhaseTransitionComplete = () => {
    setShowPhaseTransition(false);
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex flex-col items-center justify-center p-4">
      {/* フェーズ遷移アニメーション */}
      {showPhaseTransition && (
        <PhaseTransition
          fromPhase={previousPhase}
          toPhase={state.gamePhase}
          onComplete={handlePhaseTransitionComplete}
        />
      )}

      {/* ヘッダー */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          テキサスホールデムポーカー
        </h1>
        <div className="text-white/80 text-lg">
          ハンド #{state.handNumber} - {getPhaseDisplayName(state.gamePhase)}
        </div>
        {debugInfo.activePlayer && (
          <div className="text-yellow-300 text-sm mt-1">
            アクティブプレイヤー: {debugInfo.activePlayer}
          </div>
        )}
      </div>

      {/* メインゲームエリア */}
      <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-6xl w-full border-4 border-green-700">
        
        {/* ゲーム進行情報 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PhaseIndicator 
            currentPhase={state.gamePhase}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600"
          />
          <TurnIndicator
            players={state.players}
            activePlayerIndex={state.activePlayerIndex}
            gamePhase={state.gamePhase}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600"
          />
          <BlindManager />
        </div>
        
        {/* CPU プレイヤーエリア */}
        <div className="mb-8" ref={cpuAreaRef}>
          <PlayerArea
            player={state.players[1]}
            isActive={state.activePlayerIndex === 1}
            showCards={isShowdown || isGameEnded}
            className="transform scale-90"
          />
        </div>

        {/* コミュニティエリア */}
        <div className="mb-8">
          <CommunityArea
            ref={potRef}
            communityCards={state.communityCards}
            gamePhase={state.gamePhase}
            pot={state.pot}
            currentBet={state.currentBet}
          />
        </div>

        {/* プレイヤーエリア */}
        <div className="mb-8" ref={playerAreaRef}>
          <PlayerArea
            player={state.players[0]}
            isActive={state.activePlayerIndex === 0}
            showCards={true}
            className="transform scale-90"
          />
        </div>

        {/* アクションエリア */}
        <div className="flex justify-center">
          {isPlayerTurn && !isShowdown && !isGameEnded ? (
            <BettingActions className="w-full max-w-md" />
          ) : (
            <div className="text-center">
              <div className="text-white text-lg mb-4">
                {isShowdown ? 'ショーダウン中...' : 
                 isGameEnded ? 'ゲーム終了' : 
                 state.activePlayerIndex === 1 ? 'CPUの思考中...' : '待機中...'}
              </div>
            </div>
          )}
        </div>

        {/* 勝者表示（簡易版） */}
        {state.winner && !showShowdown && (
          <div className="mt-6 text-center">
            <div className="bg-yellow-500/90 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-400">
              <h3 className="text-xl font-bold text-yellow-900 mb-2">
                🏆 勝者: {state.players.find(p => p.id === state.winner)?.name}
              </h3>
              {state.winningHand && (
                <p className="text-yellow-800 font-semibold">
                  ハンド: {state.winningHand.name}
                </p>
              )}
              <p className="text-yellow-800">
                獲得ポット: ${state.pot.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* ゲームコントロール */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="primary"
            onClick={handleNewHand}
            disabled={!isShowdown && !isGameEnded}
          >
            新しいハンド
          </Button>
          <Button
            variant="secondary"
            onClick={handleNewGame}
          >
            新しいゲーム
          </Button>
        </div>

        {/* ゲーム情報 */}
        <div className="mt-6 text-center text-white/70 text-sm">
          <div className="flex justify-center gap-6 mb-2">
            <div>プレイヤー: ${state.players[0].chips.toLocaleString()}</div>
            <div>CPU: ${state.players[1].chips.toLocaleString()}</div>
            <div>ブラインド: ${state.smallBlind}/${state.bigBlind}</div>
          </div>
          <div className="flex justify-center gap-6">
            <div>BBアンティ: ${state.bbAnte}</div>
            <div>ブラインドレベル: {state.blindLevel}</div>
            <div>次増加まで: {state.handsUntilBlindIncrease}ハンド</div>
          </div>
        </div>

        {/* デバッグ情報（開発時のみ表示） */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-xs text-gray-300">
            <h4 className="font-bold mb-2">デバッグ情報:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>フェーズ: {debugInfo.gamePhase}</div>
              <div>ポット: ${debugInfo.pot}</div>
              <div>現在のベット: ${debugInfo.currentBet}</div>
              <div>プレイヤーベット: ${debugInfo.playerBet}</div>
              <div>CPUベット: ${debugInfo.cpuBet}</div>
              <div>プレイヤーフォールド: {debugInfo.playerFolded ? 'Yes' : 'No'}</div>
              <div>CPUフォールド: {debugInfo.cpuFolded ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* ショーダウン表示 */}
        {showShowdown && (
          <ShowdownDisplay
            gameState={state}
            onContinue={handleShowdownContinue}
          />
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