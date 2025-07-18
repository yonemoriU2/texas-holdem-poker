import type { GameState } from '../../types';
import { Card } from '../Card';
import { Button } from '../UI';

interface ShowdownDisplayProps {
  gameState: GameState;
  onContinue: () => void;
}

export default function ShowdownDisplay({ gameState, onContinue }: ShowdownDisplayProps) {
  const { winner, players, pot } = gameState;
  
  if (!winner) return null;

  const activePlayers = players.filter(p => !p.hasFolded);
  const isTie = winner === 'tie';
  const winningPlayers = isTie 
    ? activePlayers 
    : players.filter(p => p.id === winner);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-8 max-w-4xl w-full mx-4 border-4 border-yellow-400 shadow-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-800 mb-2">
            🏆 ショーダウン結果
          </h2>
          <div className="text-yellow-700 text-lg">
            {isTie ? '引き分け！' : '勝者決定！'}
          </div>
        </div>

        {/* 勝者情報 */}
        <div className="mb-6">
          {winningPlayers.map((player) => (
            <div key={player.id} className="mb-4">
              <div className="bg-yellow-300/50 rounded-lg p-4 border-2 border-yellow-400">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-yellow-800">
                    {player.name}
                    {isTie && <span className="text-yellow-600 ml-2">(引き分け)</span>}
                  </h3>
                  <div className="text-yellow-700 font-semibold">
                    獲得: ${isTie ? Math.floor(pot / winningPlayers.length) : pot}
                  </div>
                </div>
                
                {/* ハンド情報 */}
                {player.bestHand && (
                  <div className="mb-3">
                    <div className="text-yellow-700 font-semibold mb-2">
                      ハンド: {player.bestHand.name}
                    </div>
                    <div className="flex gap-2 mb-2">
                      {player.bestHand.cards.map((card, cardIndex) => (
                        <Card
                          key={`${card.id}-${cardIndex}`}
                          card={card}
                          faceUp={true}
                          size="small"
                          className="transform hover:scale-110 transition-transform"
                        />
                      ))}
                    </div>
                    {player.bestHand.kickers && player.bestHand.kickers.length > 0 && (
                      <div className="text-yellow-600 text-sm">
                        キッカー: {player.bestHand.kickers.map(card => `${card.rank}${card.suit}`).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* ホールカード */}
                <div>
                  <div className="text-yellow-700 font-semibold mb-2">ホールカード:</div>
                  <div className="flex gap-2">
                    {player.holeCards.map((card, cardIndex) => (
                      <Card
                        key={`hole-${card.id}-${cardIndex}`}
                        card={card}
                        faceUp={true}
                        size="small"
                        className="transform hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* コミュニティカード */}
        <div className="mb-6">
          <div className="bg-blue-100/50 rounded-lg p-4 border-2 border-blue-300">
            <div className="text-blue-700 font-semibold mb-2">コミュニティカード:</div>
            <div className="flex gap-2 justify-center">
              {gameState.communityCards.map((card, index) => (
                <Card
                  key={`community-${card.id}-${index}`}
                  card={card}
                  faceUp={true}
                  size="small"
                  className="transform hover:scale-110 transition-transform"
                />
              ))}
            </div>
          </div>
        </div>

        {/* フォールドしたプレイヤー */}
        {players.filter(p => p.hasFolded).length > 0 && (
          <div className="mb-6">
            <div className="bg-gray-100/50 rounded-lg p-4 border-2 border-gray-300">
              <div className="text-gray-700 font-semibold mb-2">フォールドしたプレイヤー:</div>
              {players.filter(p => p.hasFolded).map(player => (
                <div key={player.id} className="text-gray-600">
                  {player.name} - フォールド
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="text-center">
          <Button
            variant="primary"
            onClick={onContinue}
            className="px-8 py-3 text-lg"
          >
            続行
          </Button>
        </div>
      </div>
    </div>
  );
} 