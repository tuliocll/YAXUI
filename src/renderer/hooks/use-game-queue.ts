import { useState, useCallback, useRef } from 'react';
import type { Game, GameStatus } from '../lib/types';
import type { ConversionSettings } from '../components/settings-modal';

function extractFileName(filePath: string): string {
  const segments = filePath.replace(/\\/g, '/').split('/');
  const file = segments[segments.length - 1] || 'Unknown';
  return file.replace(/\.(iso|bin|img)$/i, '');
}

function estimateSize(): string {
  const sizes = [0.68, 1.2, 2.1, 3.5, 4.0, 4.3, 4.7, 6.8, 7.2];
  const s = sizes[Math.floor(Math.random() * sizes.length)];
  return `${s.toFixed(2)} GB`;
}

export function useGameQueue() {
  const [games, setGames] = useState<Game[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [destination, setDestination] = useState('');
  const [settings, setSettings] = useState<ConversionSettings>({
    parallelEnabled: false,
    parallelCount: 2,
  });
  const cancelRef = useRef(false);

  const addGame = useCallback((filePath: string) => {
    const name = extractFileName(filePath);
    const newGame: Game = {
      id: crypto.randomUUID(),
      name,
      filePath,
      size: estimateSize(),
      status: 'queued',
      progress: 0,
      enabled: true,
      customDestination: '',
      addedAt: new Date(),
    };
    setGames((prev) => [...prev, newGame]);
  }, []);

  const removeGame = useCallback((id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const toggleGame = useCallback((id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)),
    );
  }, []);

  const setCustomDestination = useCallback(
    (id: string, customDestination: string) => {
      setGames((prev) =>
        prev.map((g) => (g.id === id ? { ...g, customDestination } : g)),
      );
    },
    [],
  );

  const clearCompleted = useCallback(() => {
    setGames((prev) => prev.filter((g) => g.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    setGames([]);
    setIsConverting(false);
    cancelRef.current = true;
  }, []);

  const updateGameStatus = useCallback(
    (id: string, status: GameStatus, progress: number = 0) => {
      setGames((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status, progress } : g)),
      );
    },
    [],
  );

  const convertSingleGame = useCallback(
    async (game: Game): Promise<void> => {
      if (cancelRef.current) return;

      const effectiveDest = game.customDestination || destination;
      updateGameStatus(game.id, 'converting', 0);

      let jobId: string;
      try {
        jobId = (await window.electron.ipcRenderer.invoke(
          'xiso:convert',
          game.filePath,
          effectiveDest,
        )) as string;
      } catch {
        updateGameStatus(game.id, 'error', 0);
        return;
      }

      await new Promise<void>((resolve) => {
        const unsubs: Array<() => void> = [];
        const cleanup = () => unsubs.forEach((fn) => fn());

        unsubs.push(
          window.electron.ipcRenderer.on('xiso:progress', (incomingJobId) => {
            if (incomingJobId !== jobId) return;
            setGames((prev) =>
              prev.map((g) =>
                g.id === game.id
                  ? { ...g, progress: Math.min(g.progress + 2, 99) }
                  : g,
              ),
            );
          }),
        );

        unsubs.push(
          window.electron.ipcRenderer.on('xiso:complete', (incomingJobId) => {
            if (incomingJobId !== jobId) return;
            cleanup();
            updateGameStatus(game.id, 'completed', 100);
            resolve();
          }),
        );

        unsubs.push(
          window.electron.ipcRenderer.on('xiso:error', (incomingJobId) => {
            if (incomingJobId !== jobId) return;
            cleanup();
            updateGameStatus(game.id, 'error', 0);
            resolve();
          }),
        );
      });
    },
    [destination, updateGameStatus],
  );

  const startConversion = useCallback(async () => {
    setIsConverting(true);
    cancelRef.current = false;

    const enabledQueued = games.filter(
      (g) => g.status === 'queued' && g.enabled,
    );

    if (settings.parallelEnabled) {
      const batchSize = settings.parallelCount;
      for (let i = 0; i < enabledQueued.length; i += batchSize) {
        if (cancelRef.current) break;
        const batch = enabledQueued.slice(i, i + batchSize);
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(batch.map((game) => convertSingleGame(game)));
      }
    } else {
      for (const game of enabledQueued) {
        if (cancelRef.current) break;
        // eslint-disable-next-line no-await-in-loop
        await convertSingleGame(game);
      }
    }

    setIsConverting(false);
  }, [games, settings, convertSingleGame]);

  const stopConversion = useCallback(() => {
    cancelRef.current = true;
    setIsConverting(false);
  }, []);

  const totalSize = games.reduce((acc, g) => {
    const num = parseFloat(g.size);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const completedCount = games.filter((g) => g.status === 'completed').length;
  const queuedCount = games.filter(
    (g) => g.status === 'queued' && g.enabled,
  ).length;
  const convertingGame = games.find((g) => g.status === 'converting');

  return {
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
    convertingGame,
  };
}
