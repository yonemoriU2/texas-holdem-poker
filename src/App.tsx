import { GameProvider } from './context/GameContext';
import GameBoard from './components/Game/GameBoard';
import './App.css';

function App() {
  return (
    <div className="App">
      <GameProvider>
        <GameBoard />
      </GameProvider>
    </div>
  );
}

export default App;