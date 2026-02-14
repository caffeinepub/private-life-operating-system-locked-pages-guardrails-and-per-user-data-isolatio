import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Int "mo:core/Int";

module {
  type Priority = { #low; #medium; #high };
  type Duration = { #fiveMin; #fifteenMin; #thirtyMin; #fortyFiveMin };
  type EnergyLevel = { #morning; #afternoon; #evening };
  type TaskStatus = { #pending; #completed; #archived };

  type MindDumpItem = {
    id : Nat;
    content : Text;
    timestamp : Int;
    createdBy : Principal;
  };

  type Task = {
    id : Nat;
    title : Text;
    priority : Priority;
    duration : Duration;
    energyRequirement : EnergyLevel;
    status : TaskStatus;
    dueDate : Int;
    associatedProjectId : ?Nat;
    createdBy : Principal;
    editCount : Nat;
  };

  type Project = {
    id : Nat;
    name : Text;
    estimatedDuration : Duration;
    energyRequirement : EnergyLevel;
    tasks : [Nat];
    createdBy : Principal;
  };

  type WeeklyReview = {
    id : Nat;
    wins : Text;
    failures : Text;
    avoidance : Text;
    priorities : Text;
    timestamp : Int;
    createdBy : Principal;
  };

  type UserProfile = {
    name : Text;
    timezone : Text;
    accentColor : Text;
    energyPreference : EnergyLevel;
  };

  type OldActor = {
    nextTaskId : Nat;
    nextProjectId : Nat;
    nextMindDumpId : Nat;
    nextWeeklyReviewId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    tasks : Map.Map<Nat, Task>;
    projects : Map.Map<Nat, Project>;
    mindDumps : Map.Map<Nat, MindDumpItem>;
    weeklyReviews : Map.Map<Nat, WeeklyReview>;
  };

  type DailyTasks = {
    tasks : [Task];
    date : Int;
  };

  type NewActor = {
    nextTaskId : Nat;
    nextProjectId : Nat;
    nextMindDumpId : Nat;
    nextWeeklyReviewId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    tasks : Map.Map<Nat, Task>;
    projects : Map.Map<Nat, Project>;
    mindDumps : Map.Map<Nat, MindDumpItem>;
    weeklyReviews : Map.Map<Nat, WeeklyReview>;
    dailyTasks : Map.Map<Principal, [DailyTasks]>;
  };

  public func run(old : OldActor) : NewActor {
    { old with dailyTasks = Map.empty<Principal, [DailyTasks]>() };
  };
};
