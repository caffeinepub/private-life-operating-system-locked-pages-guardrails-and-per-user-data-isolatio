import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EnergyLevel } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

const ACCENT_COLORS = [
  { value: '#8B7355', label: 'Warm Brown' },
  { value: '#6B8E7F', label: 'Sage Green' },
  { value: '#8B6F47', label: 'Clay' },
  { value: '#7B8794', label: 'Slate' },
];

const ENERGY_PREFERENCES: { value: EnergyLevel; label: string }[] = [
  { value: EnergyLevel.morning, label: 'Morning' },
  { value: EnergyLevel.afternoon, label: 'Afternoon' },
  { value: EnergyLevel.evening, label: 'Evening' },
];

export default function ProfilePage() {
  const { userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [energyPreference, setEnergyPreference] = useState<EnergyLevel>(EnergyLevel.morning);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setTimezone(userProfile.timezone);
      setAccentColor(userProfile.accentColor);
      setEnergyPreference(userProfile.energyPreference);
    }
  }, [userProfile]);

  const handleSave = async () => {
    await saveProfile.mutateAsync({
      name: name.trim(),
      timezone: timezone.trim(),
      accentColor,
      energyPreference,
    });
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-light text-foreground">Profile</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage your preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <div className="space-y-3">
          <Label>Accent color</Label>
          <div className="grid grid-cols-2 gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                  accentColor === color.value ? 'border-primary' : 'border-border'
                }`}
              >
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm">{color.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Energy preference</Label>
          <RadioGroup value={energyPreference} onValueChange={(v) => setEnergyPreference(v as EnergyLevel)}>
            <div className="space-y-2">
              {ENERGY_PREFERENCES.map((pref) => (
                <div key={pref.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={pref.value} id={`pref-${pref.value}`} />
                  <Label htmlFor={`pref-${pref.value}`} className="font-normal cursor-pointer">
                    {pref.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleSave}
          disabled={!name.trim() || !timezone.trim() || saveProfile.isPending}
          className="w-full h-12"
        >
          {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
