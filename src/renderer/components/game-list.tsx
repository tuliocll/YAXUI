

import { ListX } from "lucide-react"
import { ScrollArea } from "../components/ui/scroll-area"
import { GameRow } from "../components/game-row"
import type { Game } from "../lib/types"

interface GameListProps {
  games: Game[]
  onRemove: (id: string) => void
  onToggle: (id: string) => void
  onSetCustomDestination: (id: string, dest: string) => void
}

export function GameList({
  games,
  onRemove,
  onToggle,
  onSetCustomDestination,
}: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <ListX className="h-10 w-10 opacity-30" />
        <div className="text-center">
          <p className="text-sm font-medium">No games in queue</p>
          <p className="text-xs mt-1">
            Add a .iso file path above to start building your queue
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Column header */}
      <div className="flex items-center gap-4 border-b border-border px-5 py-2 bg-muted/30">
        <span className="w-9 shrink-0" />
        <span className="w-6 shrink-0 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center">
          #
        </span>
        <span className="flex-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Game
        </span>
        <span className="w-16 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-right shrink-0">
          Size
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground shrink-0 w-24 text-center">
          Status
        </span>
        <span className="w-24 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center shrink-0">
          Progress
        </span>
        <span className="w-7 shrink-0" />
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/60">
          {games.map((game, index) => (
            <GameRow
              key={game.id}
              game={game}
              index={index}
              onRemove={onRemove}
              onToggle={onToggle}
              onSetCustomDestination={onSetCustomDestination}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
