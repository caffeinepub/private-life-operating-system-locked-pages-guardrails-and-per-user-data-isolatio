import { useState, useEffect } from 'react';
import { useGetUserMindDumps, useGetUserProjects, useClarifyMindDump, useAddProject } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Duration, EnergyLevel } from '../backend';
import { useNavigate } from '@tanstack/react-router';

const DURATIONS: { value: Duration; label: string }[] = [
  { value: Duration.fiveMin, label: '5 minutes' },
  { value: Duration.fifteenMin, label: '15 minutes' },
  { value: Duration.thirtyMin, label: '30 minutes' },
  { value: Duration.fortyFiveMin, label: '45 minutes' },
];

const ENERGY_LEVELS: { value: EnergyLevel; label: string }[] = [
  { value: EnergyLevel.morning, label: 'Low' },
  { value: EnergyLevel.afternoon, label: 'Medium' },
  { value: EnergyLevel.evening, label: 'High' },
];

export default function ClarifyPage() {
  const { data: mindDumps = [] } = useGetUserMindDumps();
  const { data: projects = [] } = useGetUserProjects();
  const clarifyMutation = useClarifyMindDump();
  const addProjectMutation = useAddProject();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActionable, setIsActionable] = useState<boolean | null>(null);
  const [nextStep, setNextStep] = useState('');
  const [duration, setDuration] = useState<Duration | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [projectId, setProjectId] = useState<string>('none');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (mindDumps.length === 0) {
      navigate({ to: '/dump' });
    }
  }, [mindDumps.length, navigate]);

  if (mindDumps.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No mind dumps to clarify</p>
          <Button onClick={() => navigate({ to: '/dump' })}>
            Go to Mind Dump
          </Button>
        </div>
      </div>
    );
  }

  const currentDump = mindDumps[currentIndex];

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !duration || !energy) return;
    await addProjectMutation.mutateAsync({
      name: newProjectName.trim(),
      estimatedDuration: duration,
      energyRequirement: energy,
    });
    setNewProjectName('');
    setShowNewProject(false);
  };

  const handleClarify = async (addToToday: boolean) => {
    if (isActionable === null) return;

    if (!isActionable) {
      await clarifyMutation.mutateAsync({
        mindDumpId: currentDump.id,
        isActionable: false,
        nextStep: '',
        duration: Duration.fiveMin,
        energyRequirement: EnergyLevel.morning,
        projectId: null,
      });
    } else {
      if (!nextStep.trim() || !duration || !energy) return;

      await clarifyMutation.mutateAsync({
        mindDumpId: currentDump.id,
        isActionable: true,
        nextStep: nextStep.trim(),
        duration,
        energyRequirement: energy,
        projectId: projectId === 'none' ? null : BigInt(projectId),
      });
    }

    // Reset for next item
    setIsActionable(null);
    setNextStep('');
    setDuration(null);
    setEnergy(null);
    setProjectId('none');

    if (currentIndex < mindDumps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-foreground">Clarify</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Item {currentIndex + 1} of {mindDumps.length}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-base leading-relaxed text-foreground">{currentDump.content}</p>
      </div>

      <div className="space-y-6">
        {isActionable === null && (
          <div className="space-y-3">
            <Label className="text-base">Is this actionable?</Label>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsActionable(true)}
                variant="outline"
                className="flex-1 h-12"
              >
                Yes
              </Button>
              <Button
                onClick={() => setIsActionable(false)}
                variant="outline"
                className="flex-1 h-12"
              >
                No
              </Button>
            </div>
          </div>
        )}

        {isActionable === false && (
          <div className="space-y-4">
            <p className="text-muted-foreground">This will be archived as a thought.</p>
            <Button onClick={() => handleClarify(false)} className="w-full h-12">
              Archive
            </Button>
          </div>
        )}

        {isActionable === true && (
          <>
            <div className="space-y-2">
              <Label htmlFor="nextStep" className="text-base">What is the very next physical step?</Label>
              <Input
                id="nextStep"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="e.g., Open laptop and create new document"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Time required</Label>
              <RadioGroup value={duration || ''} onValueChange={(v) => setDuration(v as Duration)}>
                <div className="space-y-2">
                  {DURATIONS.map((d) => (
                    <div key={d.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={d.value} id={d.value} />
                      <Label htmlFor={d.value} className="font-normal cursor-pointer">
                        {d.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Energy required</Label>
              <RadioGroup value={energy || ''} onValueChange={(v) => setEnergy(v as EnergyLevel)}>
                <div className="space-y-2">
                  {ENERGY_LEVELS.map((e) => (
                    <div key={e.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={e.value} id={e.value} />
                      <Label htmlFor={e.value} className="font-normal cursor-pointer">
                        {e.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Part of a project?</Label>
              <div className="flex gap-2">
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="flex-1 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id.toString()} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-12">New</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectName">Project name</Label>
                        <Input
                          id="projectName"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="Enter project name"
                        />
                      </div>
                      <Button
                        onClick={handleCreateProject}
                        disabled={!newProjectName.trim() || !duration || !energy || addProjectMutation.isPending}
                        className="w-full"
                      >
                        {addProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleClarify(false)}
                disabled={!nextStep.trim() || !duration || !energy || clarifyMutation.isPending}
                variant="outline"
                className="flex-1 h-12"
              >
                Add for Later
              </Button>
              <Button
                onClick={() => handleClarify(true)}
                disabled={!nextStep.trim() || !duration || !energy || clarifyMutation.isPending}
                className="flex-1 h-12"
              >
                {clarifyMutation.isPending ? 'Adding...' : 'Add to Today'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
