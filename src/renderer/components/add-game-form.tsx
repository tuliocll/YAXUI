

import { useState } from "react"
import { Plus, FileArchive, FolderSearch } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

interface AddGameFormProps {
  onAdd: (filePath: string) => void
  disabled?: boolean
}

export function AddGameForm({ onAdd, disabled }: AddGameFormProps) {
  const [filePath, setFilePath] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!filePath.trim()) return
    onAdd(filePath.trim())
    setFilePath("")
  }

  const handleBrowse = async () => {
    const paths = (await window.electron.ipcRenderer.invoke(
      "xiso:pick-file",
    )) as string[]
    if (paths.length > 0) {
      setFilePath(paths[0])
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 border-b border-border px-5 py-3"
    >
      <FileArchive className="h-4 w-4 text-primary shrink-0" />
      <Input
        placeholder="Path to .iso file (e.g. D:\Games\File.iso)"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
        disabled={disabled}
        className="flex-1 bg-muted/50 text-foreground font-mono text-sm placeholder:text-muted-foreground h-9 border-border"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleBrowse}
        disabled={disabled}
        className="shrink-0 gap-1.5 px-3 border-border text-muted-foreground hover:text-foreground"
      >
        <FolderSearch className="h-4 w-4" />
        Browse
      </Button>
      <Button
        type="submit"
        disabled={disabled || !filePath.trim()}
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-1.5 px-4"
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </form>
  )
}
