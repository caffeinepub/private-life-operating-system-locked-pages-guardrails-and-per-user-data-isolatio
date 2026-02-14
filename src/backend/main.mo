import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Type definitions
  public type Priority = { #low; #medium; #high };
  public type Duration = { #fiveMin; #fifteenMin; #thirtyMin; #fortyFiveMin };
  public type EnergyLevel = { #morning; #afternoon; #evening };
  public type TaskStatus = { #pending; #completed; #archived };

  public type MindDumpItem = {
    id : Nat;
    content : Text;
    timestamp : Int;
    createdBy : Principal;
  };

  public type Task = {
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

  public type Project = {
    id : Nat;
    name : Text;
    estimatedDuration : Duration;
    energyRequirement : EnergyLevel;
    tasks : [Nat];
    createdBy : Principal;
  };

  public type WeeklyReview = {
    id : Nat;
    wins : Text;
    failures : Text;
    avoidance : Text;
    priorities : Text;
    timestamp : Int;
    createdBy : Principal;
  };

  public type UserProfile = {
    name : Text;
    timezone : Text;
    accentColor : Text;
    energyPreference : EnergyLevel;
  };

  // Sorting helpers
  module Task {
    public func compareTasksById(a : Task, b : Task) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Project {
    public func compareProjectsById(a : Project, b : Project) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module WeeklyReview {
    public func compareWeeklyReviewsById(a : WeeklyReview, b : WeeklyReview) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // State
  var nextTaskId = 1;
  var nextProjectId = 1;
  var nextMindDumpId = 1;
  var nextWeeklyReviewId = 1;

  type DailyTasks = {
    tasks : [Task];
    date : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let tasks = Map.empty<Nat, Task>();
  let projects = Map.empty<Nat, Project>();
  let mindDumps = Map.empty<Nat, MindDumpItem>();
  let weeklyReviews = Map.empty<Nat, WeeklyReview>();
  let dailyTasks = Map.empty<Principal, [DailyTasks]>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addMindDump(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add mind dumps");
    };

    let id = nextMindDumpId;
    nextMindDumpId += 1;

    let mindDumpItem : MindDumpItem = {
      id;
      content;
      timestamp = 0;
      createdBy = caller;
    };
    mindDumps.add(id, mindDumpItem);
  };

  public shared ({ caller }) func clarifyMindDump(
    mindDumpId : Nat,
    isActionable : Bool,
    nextStep : Text,
    duration : Duration,
    energyRequirement : EnergyLevel,
    projectId : ?Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clarify mind dumps");
    };

    switch (mindDumps.get(mindDumpId)) {
      case (?mindDump) {
        // Verify ownership
        if (mindDump.createdBy != caller) {
          Runtime.trap("Unauthorized: Can only clarify your own mind dumps");
        };

        if (not isActionable) {
          mindDumps.remove(mindDumpId);
        } else {
          // Verify project ownership if projectId is provided
          switch (projectId) {
            case (?pid) {
              switch (projects.get(pid)) {
                case (?project) {
                  if (project.createdBy != caller) {
                    Runtime.trap("Unauthorized: Can only associate with your own projects");
                  };
                };
                case (null) {
                  Runtime.trap("Project not found");
                };
              };
            };
            case (null) {};
          };

          let taskId = nextTaskId;
          nextTaskId += 1;

          let task : Task = {
            id = taskId;
            title = nextStep;
            priority = #medium;
            duration;
            energyRequirement;
            status = #pending;
            dueDate = 0;
            associatedProjectId = projectId;
            createdBy = caller;
            editCount = 0;
          };

          tasks.add(taskId, task);
          mindDumps.remove(mindDumpId);
        };
      };
      case (null) { Runtime.trap("Mind dump item not found") };
    };
  };

  public shared ({ caller }) func addTask(
    title : Text,
    priority : Priority,
    duration : Duration,
    energyRequirement : EnergyLevel
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };

    if (countUserTasks(caller) >= 3) {
      Runtime.trap("Cannot have more than 3 tasks per day");
    };

    let taskId = nextTaskId;
    nextTaskId += 1;

    let task : Task = {
      id = taskId;
      title;
      priority;
      duration;
      energyRequirement;
      status = #pending;
      dueDate = 0;
      associatedProjectId = null;
      createdBy = caller;
      editCount = 0;
    };

    tasks.add(taskId, task);
  };

  func countUserTasks(user : Principal) : Nat {
    var count = 0;
    for ((_, task) in tasks.entries()) {
      if (task.createdBy == user) { count += 1 };
    };
    count;
  };

  public shared ({ caller }) func addProject(
    name : Text,
    estimatedDuration : Duration,
    energyRequirement : EnergyLevel
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add projects");
    };

    let projectId = nextProjectId;
    nextProjectId += 1;

    let project : Project = {
      id = projectId;
      name;
      estimatedDuration;
      energyRequirement;
      tasks = [];
      createdBy = caller;
    };

    projects.add(projectId, project);
  };

  public shared ({ caller }) func addWeeklyReview(
    wins : Text,
    failures : Text,
    avoidance : Text,
    priorities : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add weekly reviews");
    };

    let reviewId = nextWeeklyReviewId;
    nextWeeklyReviewId += 1;

    let weeklyReview : WeeklyReview = {
      id = reviewId;
      wins;
      failures;
      avoidance;
      priorities;
      timestamp = 0;
      createdBy = caller;
    };

    weeklyReviews.add(reviewId, weeklyReview);
  };

  public query ({ caller }) func getUserTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    tasks.values().toArray().filter(
      func(task) { task.createdBy == caller }
    ).sort(Task.compareTasksById);
  };

  public query ({ caller }) func getUserProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    projects.values().toArray().filter(
      func(project) { project.createdBy == caller }
    ).sort(Project.compareProjectsById);
  };

  public query ({ caller }) func getUserMindDumps() : async [MindDumpItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mind dumps");
    };

    mindDumps.values().toArray().filter(
      func(mindDump) { mindDump.createdBy == caller }
    );
  };

  public query ({ caller }) func getUserWeeklyReviews() : async [WeeklyReview] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weekly reviews");
    };

    weeklyReviews.values().toArray().filter(
      func(review) { review.createdBy == caller }
    ).sort(WeeklyReview.compareWeeklyReviewsById);
  };

  public shared ({ caller }) func markTaskDone(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark tasks done");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (task.createdBy != caller) {
          Runtime.trap("Unauthorized: Can only complete your own tasks");
        };

        let updatedTask = { task with status = #completed };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  public query ({ caller }) func getCurrentDailyTasks() : async ?[Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily tasks");
    };

    switch (dailyTasks.get(caller)) {
      case (null) { null };
      case (?dailyTasksList) {
        if (dailyTasksList.size() > 0) {
          ?dailyTasksList[dailyTasksList.size() - 1].tasks;
        } else {
          null;
        };
      };
    };
  };

  public shared ({ caller }) func resetWeeklyTasks() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset weekly tasks");
    };

    dailyTasks.remove(caller);
  };
};
