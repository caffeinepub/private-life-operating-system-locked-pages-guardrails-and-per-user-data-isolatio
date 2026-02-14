import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Task } from '../backend';

interface FocusModeProps {
  task: Task;
  onExit: () => void;
  onMarkDone: (taskId: bigint) => Promise<void>;
}

export default function FocusMode({ task, onExit, onMarkDone }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleMarkDone = async () => {
    setIsMarkingDone(true);
    try {
      await onMarkDone(task.id);
      onExit();
    } catch (error) {
      console.error('Failed to mark task as done:', error);
      setIsMarkingDone(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-light text-foreground">{task.title}</h1>
        </div>

        <div className="space-y-8">
          <div className="text-7xl font-light tabular-nums text-foreground">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant="outline"
              className="flex-1 h-12"
              disabled={isMarkingDone}
            >
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleMarkDone} 
            className="w-full h-12"
            disabled={isMarkingDone}
          >
            {isMarkingDone ? 'Marking Done...' : 'Mark Done'}
          </Button>
          <Button 
            onClick={onExit} 
            variant="ghost" 
            className="w-full h-12"
            disabled={isMarkingDone}
          >
            Exit Focus Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
