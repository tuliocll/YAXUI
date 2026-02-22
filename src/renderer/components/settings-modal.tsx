

import { useState } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { Slider } from "../components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"

export interface ConversionSettings {
  parallelEnabled: boolean
  parallelCount: number
}

interface SettingsModalProps {
  settings: ConversionSettings
  onSettingsChange: (settings: ConversionSettings) => void
  disabled?: boolean
}

export function SettingsModal({
  settings,
  onSettingsChange,
  disabled,
}: SettingsModalProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ConversionSettings>(settings)

  const handleOpen = () => {
    setDraft({ ...settings })
    setOpen(true)
  }

  const handleSave = () => {
    onSettingsChange(draft)
    setOpen(false)
  }

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpen}
              disabled={disabled}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Conversion settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conversion Settings</DialogTitle>
            <DialogDescription>
              Configure how the conversion queue is processed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Parallel processing toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="parallel-toggle"
                  className="text-sm font-medium"
                >
                  Parallel Processing
                </Label>
                <p className="text-xs text-muted-foreground">
                  Convert multiple games at the same time
                </p>
              </div>
              <Switch
                id="parallel-toggle"
                checked={draft.parallelEnabled}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, parallelEnabled: checked }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Concurrency slider */}
            <div
              className={`space-y-3 transition-opacity ${draft.parallelEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Max Concurrent Jobs
                </Label>
                <span className="text-sm font-mono font-semibold text-primary tabular-nums bg-primary/10 rounded-md px-2 py-0.5">
                  {draft.parallelCount}
                </span>
              </div>
              <Slider
                min={2}
                max={8}
                step={1}
                value={[draft.parallelCount]}
                onValueChange={([val]) =>
                  setDraft((prev) => ({ ...prev, parallelCount: val }))
                }
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher values speed up the queue but use more system resources.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
