import { useState } from 'react';
import { useGetUserProjects, useGetUserTasks } from '../hooks/useQueries';
import ProjectCard from '../components/ProjectCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Project, Task } from '../backend';

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useGetUserProjects();
  const { data: allTasks = [] } = useGetUserTasks();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projectTasks = selectedProject
    ? allTasks.filter(t => t.associatedProjectId?.toString() === selectedProject.id.toString())
    : [];

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-light text-foreground">Projects</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {projects.length === 0 ? 'No projects yet' : `${projects.length} active projects`}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Create projects while clarifying your mind dumps</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const tasks = allTasks.filter(t => t.associatedProjectId?.toString() === project.id.toString());
              const completedTasks = tasks.filter(t => t.status === 'completed').length;
              const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

              return (
                <ProjectCard
                  key={project.id.toString()}
                  project={project}
                  progress={progress}
                  taskCount={tasks.length}
                  onClick={() => setSelectedProject(project)}
                />
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="text-2xl font-light">{selectedProject?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {projectTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks in this project yet</p>
            ) : (
              projectTasks.map((task) => (
                <div key={task.id.toString()} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-medium text-foreground">{task.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground capitalize">
                    {task.status} • {task.duration.replace('Min', ' min')}
                  </p>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
