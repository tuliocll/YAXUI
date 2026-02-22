export type GameStatus = 'queued' | 'converting' | 'completed' | 'error';

export interface Game {
  id: string;
  name: string;
  filePath: string;
  size: string;
  status: GameStatus;
  progress: number;
  enabled: boolean;
  customDestination: string;
  addedAt: Date;
}
