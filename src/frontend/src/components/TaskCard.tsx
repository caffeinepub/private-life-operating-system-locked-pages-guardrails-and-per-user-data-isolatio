import { Button } from '@/components/ui/button';
import type { Task } from '../backend';

interface TaskCardProps {
  task: Task;
  onFocus: () => void;
}

export default function TaskCard({ task, onFocus }: TaskCardProps) {
  const durationLabel = task.duration.replace('Min', ' min');

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">{task.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {durationLabel} • {task.energyRequirement === 'morning' ? 'Low' : task.energyRequirement === 'afternoon' ? 'Medium' : 'High'} energy
        </p>
      </div>

      <Button onClick={onFocus} className="w-full h-11">
        Enter Focus Mode
      </Button>
    </div>
  );
}
