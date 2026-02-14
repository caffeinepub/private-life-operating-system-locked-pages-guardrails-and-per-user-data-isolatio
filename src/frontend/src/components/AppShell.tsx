import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-6 py-8 pb-24 mx-auto w-full max-w-2xl">
        {children}
      </main>
      {!hideNav && <BottomNav />}
      <footer className="border-t border-border bg-background py-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} • Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'life-os'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
