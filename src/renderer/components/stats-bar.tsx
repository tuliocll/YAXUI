import { Gamepad2, HardDrive, CheckCircle2, Clock } from 'lucide-react';

interface StatsBarProps {
  totalGames: number;
  totalSize: number;
  completedCount: number;
  queuedCount: number;
}

export default function StatsBar({
  totalGames,
  totalSize,
  completedCount,
  queuedCount,
}: StatsBarProps) {
  const stats = [
    {
      label: 'Total',
      value: totalGames,
      icon: Gamepad2,
    },
    {
      label: 'Queued',
      value: queuedCount,
      icon: Clock,
    },
    {
      label: 'Done',
      value: completedCount,
      icon: CheckCircle2,
    },
    {
      label: 'Size',
      value: `${totalSize.toFixed(1)} GB`,
      icon: HardDrive,
    },
  ];

  return (
    <div className="grid grid-cols-4 border-b border-border">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex items-center gap-2.5 px-5 py-2.5 ${i < 3 ? 'border-r border-border' : ''}`}
          >
            <Icon className="h-4 w-4 text-primary/70 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                {stat.label}
              </span>
              <span className="text-sm font-semibold text-foreground font-mono">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
