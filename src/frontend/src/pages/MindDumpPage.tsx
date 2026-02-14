import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAddMindDump } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';

export default function MindDumpPage() {
  const [content, setContent] = useState('');
  const addMindDump = useAddMindDump();
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!content.trim()) return;
    await addMindDump.mutateAsync(content.trim());
    setContent('');
  };

  const handleClarifyNow = async () => {
    if (content.trim()) {
      await addMindDump.mutateAsync(content.trim());
      setContent('');
    }
    navigate({ to: '/clarify' });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-light text-foreground">Mind Dump</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Empty your mind. Don't organize.
        </p>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write everything that's in your head. Don't organize."
        className="flex-1 resize-none text-base leading-relaxed"
      />

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={!content.trim() || addMindDump.isPending}
          variant="outline"
          className="flex-1 h-12"
        >
          {addMindDump.isPending ? 'Saving...' : 'Save dump'}
        </Button>
        <Button
          onClick={handleClarifyNow}
          disabled={addMindDump.isPending}
          className="flex-1 h-12"
        >
          Clarify now
        </Button>
      </div>
    </div>
  );
}
