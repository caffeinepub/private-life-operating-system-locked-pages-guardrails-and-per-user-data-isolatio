import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Navigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import MindDumpPage from './pages/MindDumpPage';
import ClarifyPage from './pages/ClarifyPage';
import ProjectsPage from './pages/ProjectsPage';
import WeeklyResetPage from './pages/WeeklyResetPage';
import ProfilePage from './pages/ProfilePage';
import AppShell from './components/AppShell';
import { useEffect } from 'react';
import { applyAccentColor } from './theme/accent';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!identity) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (identity) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AuthenticatedLayout() {
  const { userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const showOnboarding = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (userProfile?.accentColor) {
      applyAccentColor(userProfile.accentColor);
    }
  }, [userProfile?.accentColor]);

  if (profileLoading && !isFetched) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingPage />;
  }

  return <AppShell><Outlet /></AppShell>;
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <RequireGuest>
      <LoginPage />
    </RequireGuest>
  ),
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: () => (
    <RequireAuth>
      <AuthenticatedLayout />
    </RequireAuth>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});

const dumpRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dump',
  component: MindDumpPage,
});

const clarifyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/clarify',
  component: ClarifyPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/projects',
  component: ProjectsPage,
});

const resetRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/reset',
  component: WeeklyResetPage,
});

const profileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/profile',
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    dumpRoute,
    clarifyRoute,
    projectsRoute,
    resetRoute,
    profileRoute,
  ]),
]);

const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
