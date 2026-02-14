import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    status: TaskStatus;
    title: string;
    duration: Duration;
    associatedProjectId?: bigint;
    createdBy: Principal;
    energyRequirement: EnergyLevel;
    dueDate: bigint;
    priority: Priority;
    editCount: bigint;
}
export interface MindDumpItem {
    id: bigint;
    content: string;
    createdBy: Principal;
    timestamp: bigint;
}
export interface Project {
    id: bigint;
    tasks: Array<bigint>;
    name: string;
    createdBy: Principal;
    energyRequirement: EnergyLevel;
    estimatedDuration: Duration;
}
export interface WeeklyReview {
    id: bigint;
    failures: string;
    avoidance: string;
    createdBy: Principal;
    wins: string;
    timestamp: bigint;
    priorities: string;
}
export interface UserProfile {
    timezone: string;
    energyPreference: EnergyLevel;
    name: string;
    accentColor: string;
}
export enum Duration {
    thirtyMin = "thirtyMin",
    fifteenMin = "fifteenMin",
    fiveMin = "fiveMin",
    fortyFiveMin = "fortyFiveMin"
}
export enum EnergyLevel {
    morning = "morning",
    evening = "evening",
    afternoon = "afternoon"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed",
    archived = "archived"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMindDump(content: string): Promise<void>;
    addProject(name: string, estimatedDuration: Duration, energyRequirement: EnergyLevel): Promise<void>;
    addTask(title: string, priority: Priority, duration: Duration, energyRequirement: EnergyLevel): Promise<void>;
    addWeeklyReview(wins: string, failures: string, avoidance: string, priorities: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clarifyMindDump(mindDumpId: bigint, isActionable: boolean, nextStep: string, duration: Duration, energyRequirement: EnergyLevel, projectId: bigint | null): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentDailyTasks(): Promise<Array<Task> | null>;
    getUserMindDumps(): Promise<Array<MindDumpItem>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProjects(): Promise<Array<Project>>;
    getUserTasks(): Promise<Array<Task>>;
    getUserWeeklyReviews(): Promise<Array<WeeklyReview>>;
    isCallerAdmin(): Promise<boolean>;
    markTaskDone(taskId: bigint): Promise<void>;
    resetWeeklyTasks(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
