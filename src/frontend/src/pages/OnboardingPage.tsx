import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { detectTimezone } from '../utils/timezone';
import { EnergyLevel } from '../backend';

const screens = [
  {
    title: "This is not a productivity app.",
    content: "This is a quiet place where your mind doesn't have to remember everything.",
  },
  {
    title: "How it works:",
    content: (
      <ul className="space-y-3 text-left">
        <li>• Dump thoughts</li>
        <li>• Turn them into small actions</li>
        <li>• Do only 3 things a day</li>
      </ul>
    ),
  },
  {
    title: "Rules:",
    content: (
      <ul className="space-y-3 text-left">
        <li>Small steps only</li>
        <li>Imperfect action &gt; perfect plans</li>
        <li>Trust the system</li>
      </ul>
    ),
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState(detectTimezone());
  const saveProfile = useSaveCallerUserProfile();
  const navigate = useNavigate();

  const isLastScreen = step === screens.length - 1;
  const isNameStep = step === screens.length;

  const handleNext = () => {
    if (isLastScreen) {
      setStep(screens.length);
    } else {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) return;

    await saveProfile.mutateAsync({
      name: name.trim(),
      timezone,
      accentColor: '#8B7355',
      energyPreference: EnergyLevel.morning,
    });

    navigate({ to: '/dump' });
  };

  if (isNameStep) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-light text-foreground">What should we call you?</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <Button
              onClick={handleComplete}
              disabled={!name.trim() || saveProfile.isPending}
              className="w-full h-12 text-base"
              size="lg"
            >
              {saveProfile.isPending ? 'Setting up...' : "I agree. Let's begin"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentScreen = screens[step];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-12">
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-light text-foreground leading-relaxed">
            {currentScreen.title}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed">
            {currentScreen.content}
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleNext}
            className="w-full h-12 text-base"
            size="lg"
          >
            Continue
          </Button>

          <div className="flex justify-center gap-2">
            {screens.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
