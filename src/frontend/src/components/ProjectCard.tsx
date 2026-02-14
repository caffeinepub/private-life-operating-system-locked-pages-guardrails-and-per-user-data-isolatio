import { Progress } from '@/components/ui/progress';
import type { Project } from '../backend';

interface ProjectCardProps {
  project: Project;
  progress: number;
  taskCount: number;
  onClick: () => void;
}

export default function ProjectCard({ project, progress, taskCount, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-6 text-left transition-colors hover:bg-accent"
    >
      <h3 className="text-lg font-medium text-foreground">{project.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
      </p>
      <div className="mt-4 space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
      </div>
    </button>
  );
}
