

import { Gamepad2 } from "lucide-react"
import { Badge } from "../components/ui/badge"
import {
  SettingsModal,
  type ConversionSettings,
} from "../components/settings-modal"

interface ConverterHeaderProps {
  settings: ConversionSettings
  onSettingsChange: (settings: ConversionSettings) => void
  isConverting?: boolean
}

export function ConverterHeader({
  settings,
  onSettingsChange,
  isConverting,
}: ConverterHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border px-5 py-3.5">
      <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
        <Gamepad2 className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            YAXUI
          </h1>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 font-mono text-muted-foreground"
          >
            v{window.electron.appVersion}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Yet Another xiso UI
        </p>
      </div>
      <SettingsModal
        settings={settings}
        onSettingsChange={onSettingsChange}
        disabled={isConverting}
      />
    </header>
  )
}
