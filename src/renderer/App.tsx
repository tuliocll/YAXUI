import { useEffect } from 'react';
import { AddGameForm } from './components/add-game-form';
import { ConversionControls } from './components/conversion-controls';
import { ConverterHeader } from './components/converter-header';
import { GameList } from './components/game-list';
import StatsBar from './components/stats-bar';
import { useGameQueue } from './hooks/use-game-queue';

export default function App() {
  const {
    games,
    isConverting,
    destination,
    setDestination,
    settings,
    setSettings,
    addGame,
    removeGame,
    toggleGame,
    setCustomDestination,
    clearCompleted,
    clearAll,
    startConversion,
    stopConversion,
    totalSize,
    completedCount,
    queuedCount,
  } = useGameQueue();

  useEffect(() => {
    console.log('Games:', games);
  }, [games]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex h-screen w-full flex-col overflow-hidden bg-card shadow-xl">
        <ConverterHeader
          settings={settings}
          onSettingsChange={setSettings}
          isConverting={isConverting}
        />
        <StatsBar
          totalGames={games.length}
          totalSize={totalSize}
          completedCount={completedCount}
          queuedCount={queuedCount}
        />
        <AddGameForm onAdd={addGame} disabled={isConverting} />
        <GameList
          games={games}
          onRemove={removeGame}
          onToggle={toggleGame}
          onSetCustomDestination={setCustomDestination}
        />
        <ConversionControls
          destination={destination}
          onDestinationChange={setDestination}
          isConverting={isConverting}
          hasGames={games.length > 0}
          hasQueued={queuedCount > 0}
          hasCompleted={completedCount > 0}
          onStart={startConversion}
          onStop={stopConversion}
          onClearCompleted={clearCompleted}
          onClearAll={clearAll}
        />
      </div>
    </main>
  );
}
