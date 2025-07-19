import { GameProvider } from './context/GameContext';
import GameBoard from './components/Game/GameBoard';
import ErrorBoundary from './components/UI/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <GameProvider>
          <GameBoard />
        </GameProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;