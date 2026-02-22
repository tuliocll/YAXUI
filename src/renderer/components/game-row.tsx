

import { useState } from "react"
import {
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  MoreVertical,
  FolderOpen,
  FolderSearch,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import { Switch } from "../components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import type { Game } from "../lib/types"
import { cn } from "../lib/utils"

interface GameRowProps {
  game: Game
  index: number
  onRemove: (id: string) => void
  onToggle: (id: string) => void
  onSetCustomDestination: (id: string, dest: string) => void
}

const statusConfig = {
  queued: {
    label: "In queue",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  converting: {
    label: "Converting",
    icon: Loader2,
    className: "bg-primary/10 text-primary",
  },
  completed: {
    label: "Done",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive",
  },
}

export function GameRow({
  game,
  index,
  onRemove,
  onToggle,
  onSetCustomDestination,
}: GameRowProps) {
  const config = statusConfig[game.status]
  const StatusIcon = config.icon
  const [destDialogOpen, setDestDialogOpen] = useState(false)
  const [tempDest, setTempDest] = useState(game.customDestination)
  const handleBrowseFolder = async () => {
    const folder = (await window.electron.ipcRenderer.invoke(
      "xiso:pick-folder",
    )) as string | null
    if (folder) setTempDest(folder)
  }

  const handleSaveCustomDest = () => {
    onSetCustomDestination(game.id, tempDest)
    setDestDialogOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/50",
          game.status === "converting" && "bg-primary/[0.03]",
          !game.enabled && game.status === "queued" && "opacity-50"
        )}
      >
        {/* Toggle */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <Switch
            checked={game.enabled}
            onCheckedChange={() => onToggle(game.id)}
            disabled={game.status === "converting" || game.status === "completed"}
            className="shrink-0 data-[state=checked]:bg-primary"
            aria-label={`Toggle processing ${game.name}`}
          />
          <span className="text-[10px] text-muted-foreground leading-none select-none">
            Process
          </span>
        </div>

        {/* Index */}
        <span className="w-6 text-xs font-mono text-muted-foreground text-center shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Name + path */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground leading-tight">
            {game.name}
          </p>
          <p className="truncate text-xs text-muted-foreground font-mono mt-0.5">
            {game.filePath}
          </p>
          {game.customDestination && (
            <p className="truncate text-xs text-primary/70 font-mono mt-0.5 flex items-center gap-1">
              <FolderOpen className="h-3 w-3 shrink-0" />
              {game.customDestination}
            </p>
          )}
        </div>

        {/* Size */}
        <span className="text-xs text-muted-foreground font-mono shrink-0 w-16 text-right">
          {game.size}
        </span>

        {/* Status badge */}
        <Badge
          variant="secondary"
          className={cn(
            "gap-1 text-xs shrink-0 border-0 font-medium",
            config.className
          )}
        >
          <StatusIcon
            className={cn(
              "h-3 w-3",
              game.status === "converting" && "animate-spin"
            )}
          />
          {config.label}
        </Badge>

        {/* Progress */}
        <div className="w-24 shrink-0">
          {game.status === "converting" ? (
            <div className="flex flex-col gap-1">
              <Progress value={game.progress} className="h-1.5" />
              <span className="text-[10px] text-primary font-mono text-right">
                {game.progress}%
              </span>
            </div>
          ) : game.status === "completed" ? (
            <span className="text-xs text-primary font-medium block text-center">
              100%
            </span>
          ) : (
            <span className="text-xs text-muted-foreground block text-center">
              --
            </span>
          )}
        </div>

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Game options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setTempDest(game.customDestination)
                setDestDialogOpen(true)
              }}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Custom destination
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRemove(game.id)}
              disabled={game.status === "converting"}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Custom destination dialog */}
      <Dialog open={destDialogOpen} onOpenChange={setDestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Custom Destination</DialogTitle>
            <DialogDescription>
              Set a specific output folder for{" "}
              <span className="font-medium text-foreground">{game.name}</span>.
              Leave empty to use the global destination.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              placeholder="/path/to/custom/destination"
              value={tempDest}
              onChange={(e) => setTempDest(e.target.value)}
              className="font-mono text-sm flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleBrowseFolder}
              className="shrink-0"
            >
              <FolderSearch className="h-4 w-4" />
              <span className="sr-only">Browse folder</span>
            </Button>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setTempDest("")
                onSetCustomDestination(game.id, "")
                setDestDialogOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleSaveCustomDest}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
