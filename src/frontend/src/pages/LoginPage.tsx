import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function LoginPage() {
  const { login, loginStatus, isLoginError } = useInternetIdentity();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img 
            src="/assets/generated/life-os-icon.dim_512x512.png" 
            alt="Life OS" 
            className="mx-auto h-20 w-20 mb-6"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Life OS
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Your private thinking and execution space
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full h-12 text-base"
            size="lg"
          >
            {loginStatus === 'logging-in' ? 'Connecting...' : 'Login'}
          </Button>

          {isLoginError && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              Login failed. Please try again.
            </div>
          )}

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About authentication
          </button>

          {showInfo && (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              <p>
                This app uses Internet Identity for secure, private authentication. 
                Your data is isolated and only accessible to you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
