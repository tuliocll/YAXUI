

import { useState } from "react"
import {
  Play,
  Square,
  Trash2,
  FolderOpen,
  FolderSearch,
  ExternalLink,
  CheckCheck,
  HardDrive,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"

interface ConversionControlsProps {
  destination: string
  onDestinationChange: (val: string) => void
  isConverting: boolean
  hasGames: boolean
  hasQueued: boolean
  hasCompleted: boolean
  onStart: () => void
  onStop: () => void
  onClearCompleted: () => void
  onClearAll: () => void
}

export function ConversionControls({
  destination,
  onDestinationChange,
  isConverting,
  hasGames,
  hasQueued,
  hasCompleted,
  onStart,
  onStop,
  onClearCompleted,
  onClearAll,
}: ConversionControlsProps) {
  const [destDialogOpen, setDestDialogOpen] = useState(false)
  const [tempDest, setTempDest] = useState(destination)
  const handleOpenDialog = () => {
    setTempDest(destination)
    setDestDialogOpen(true)
  }

  const handleSave = () => {
    onDestinationChange(tempDest)
    setDestDialogOpen(false)
  }

  const handleBrowseFolder = async () => {
    const folder = (await window.electron.ipcRenderer.invoke(
      "xiso:pick-folder",
    )) as string | null
    if (folder) setTempDest(folder)
  }

  return (
    <TooltipProvider>
      <footer className="border-t border-border bg-card mt-auto">
        {/* Destination row */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <button
            type="button"
            onClick={handleOpenDialog}
            className="flex items-center gap-2 shrink-0 text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Destination
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenDialog}
            className="flex-1 text-left bg-muted/50 rounded-md px-3 py-1.5 border border-border hover:border-primary/40 transition-colors cursor-pointer"
          >
            {destination ? (
              <span className="text-sm font-mono text-foreground truncate block">
                {destination}
              </span>
            ) : (
              <span className="text-sm font-mono text-muted-foreground">
                Click to set output folder...
              </span>
            )}
          </button>

          {destination && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                  onClick={() =>
                    window.open(`file:///${destination}`, "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open folder in explorer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in explorer</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2">
            {hasGames && !isConverting && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="gap-1.5 text-xs border-border text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </Button>
            )}
            {hasCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCompleted}
                className="gap-1.5 text-xs border-border text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Clear Done
              </Button>
            )}

            {isConverting && (
              <div className="flex items-center gap-2 ml-2">
                <HardDrive className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs text-primary font-medium">
                  Converting...
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isConverting ? (
              <Button
                onClick={onStart}
                disabled={!hasQueued || !destination}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              >
                <Play className="h-4 w-4" />
                Start Conversion
              </Button>
            ) : (
              <Button
                onClick={onStop}
                variant="destructive"
                className="gap-1.5"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Destination dialog */}
      <Dialog open={destDialogOpen} onOpenChange={setDestDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Set Destination Folder</DialogTitle>
            <DialogDescription>
              Choose the output folder where converted Xbox 360 games will be
              saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              placeholder="/path/to/xbox360/output"
              value={tempDest}
              onChange={(e) => setTempDest(e.target.value)}
              className="font-mono text-sm flex-1"
              autoFocus
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDestDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
