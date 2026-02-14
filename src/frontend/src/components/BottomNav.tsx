import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Brain, Sparkles, FolderKanban, RotateCcw } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/dump', label: 'Dump', icon: Brain },
  { path: '/clarify', label: 'Clarify', icon: Sparkles },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/reset', label: 'Reset', icon: RotateCcw },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
