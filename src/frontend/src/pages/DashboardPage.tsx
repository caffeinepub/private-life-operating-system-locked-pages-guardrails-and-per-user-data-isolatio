import { useState } from 'react';
import { useGetUserTasks, useMarkTaskDone } from '../hooks/useQueries';
import TaskCard from '../components/TaskCard';
import FocusMode from '../components/FocusMode';
import { Task, EnergyLevel } from '../backend';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: allTasks = [], isLoading } = useGetUserTasks();
  const markTaskDone = useMarkTaskDone();
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const pendingTasks = allTasks.filter(t => t.status === 'pending').slice(0, 3);

  const filteredTasks = selectedEnergy
    ? pendingTasks.filter(t => t.energyRequirement === selectedEnergy)
    : pendingTasks;

  const handleMarkDone = async (taskId: bigint) => {
    await markTaskDone.mutateAsync(taskId);
  };

  if (focusTask) {
    return (
      <FocusMode 
        task={focusTask} 
        onExit={() => setFocusTask(null)}
        onMarkDone={handleMarkDone}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-foreground">Today</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {pendingTasks.length === 0 ? 'No tasks yet' : `${pendingTasks.length} of 3 tasks`}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Energy level</p>
        <div className="flex gap-2">
          {([EnergyLevel.morning, EnergyLevel.afternoon, EnergyLevel.evening] as EnergyLevel[]).map((energy) => (
            <Button
              key={energy}
              variant={selectedEnergy === energy ? 'default' : 'outline'}
              onClick={() => setSelectedEnergy(selectedEnergy === energy ? null : energy)}
              className="capitalize"
            >
              {energy === EnergyLevel.morning ? 'Low' : energy === EnergyLevel.afternoon ? 'Medium' : 'High'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {pendingTasks.length === 0
              ? 'Start by dumping your thoughts'
              : 'No tasks match your energy level'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id.toString()} task={task} onFocus={() => setFocusTask(task)} />
          ))}
        </div>
      )}
    </div>
  );
}
