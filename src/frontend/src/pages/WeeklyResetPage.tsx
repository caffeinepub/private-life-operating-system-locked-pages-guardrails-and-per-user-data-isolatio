import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAddWeeklyReview, useResetWeeklyTasks } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';

export default function WeeklyResetPage() {
  const [wins, setWins] = useState('');
  const [failures, setFailures] = useState('');
  const [avoidance, setAvoidance] = useState('');
  const [priorities, setPriorities] = useState('');
  const addReview = useAddWeeklyReview();
  const resetTasks = useResetWeeklyTasks();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // First save the weekly review
      await addReview.mutateAsync({
        wins: wins.trim(),
        failures: failures.trim(),
        avoidance: avoidance.trim(),
        priorities: priorities.trim(),
      });

      // Then clear the tasks for the new week
      await resetTasks.mutateAsync();

      // Clear form
      setWins('');
      setFailures('');
      setAvoidance('');
      setPriorities('');

      // Navigate back to dashboard
      navigate({ to: '/' });
    } catch (error) {
      console.error('Failed to complete weekly reset:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const canSubmit = wins.trim() || failures.trim() || avoidance.trim() || priorities.trim();

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-light text-foreground">Weekly Reset</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Reflect and prepare for the week ahead
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="wins" className="text-base">What went well?</Label>
          <Textarea
            id="wins"
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            placeholder="Celebrate your wins..."
            className="min-h-24 text-base"
            disabled={isResetting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="failures" className="text-base">What didn't work?</Label>
          <Textarea
            id="failures"
            value={failures}
            onChange={(e) => setFailures(e.target.value)}
            placeholder="What can you learn from?"
            className="min-h-24 text-base"
            disabled={isResetting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avoidance" className="text-base">What did I avoid?</Label>
          <Textarea
            id="avoidance"
            value={avoidance}
            onChange={(e) => setAvoidance(e.target.value)}
            placeholder="Be honest with yourself..."
            className="min-h-24 text-base"
            disabled={isResetting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priorities" className="text-base">Top 3 priorities next week</Label>
          <Textarea
            id="priorities"
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            placeholder="What matters most?"
            className="min-h-24 text-base"
            disabled={isResetting}
          />
        </div>

        <Button
          onClick={handleReset}
          disabled={!canSubmit || isResetting}
          className="w-full h-12 text-base"
        >
          {isResetting ? 'Resetting...' : 'Close this week & reset'}
        </Button>
      </div>
    </div>
  );
}
