import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Task, MindDumpItem, Project, WeeklyReview, Duration, EnergyLevel, Priority } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    userProfile: query.data,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetUserTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['userTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserTasks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserMindDumps() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MindDumpItem[]>({
    queryKey: ['userMindDumps'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserMindDumps();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['userProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserProjects();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserWeeklyReviews() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WeeklyReview[]>({
    queryKey: ['userWeeklyReviews'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserWeeklyReviews();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddMindDump() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addMindDump(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMindDumps'] });
      toast.success('Mind dump saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save mind dump');
    },
  });
}

export function useClarifyMindDump() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      mindDumpId: bigint;
      isActionable: boolean;
      nextStep: string;
      duration: Duration;
      energyRequirement: EnergyLevel;
      projectId: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.clarifyMindDump(
        params.mindDumpId,
        params.isActionable,
        params.nextStep,
        params.duration,
        params.energyRequirement,
        params.projectId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMindDumps'] });
      queryClient.invalidateQueries({ queryKey: ['userTasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clarify mind dump');
    },
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      estimatedDuration: Duration;
      energyRequirement: EnergyLevel;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addProject(params.name, params.estimatedDuration, params.energyRequirement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      toast.success('Project created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
}

export function useAddWeeklyReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      wins: string;
      failures: string;
      avoidance: string;
      priorities: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addWeeklyReview(params.wins, params.failures, params.avoidance, params.priorities);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWeeklyReviews'] });
      toast.success('Weekly review saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save weekly review');
    },
  });
}

export function useMarkTaskDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markTaskDone(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTasks'] });
      toast.success('Task completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark task as done');
    },
  });
}

export function useResetWeeklyTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.resetWeeklyTasks();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTasks'] });
      toast.success('Tasks cleared for new week');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset tasks');
    },
  });
}
