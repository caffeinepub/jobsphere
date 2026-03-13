import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  type UserRole = {
    #jobSeeker;
    #employer;
  };

  type UserProfile = {
    id : Principal;
    role : UserRole;
    name : Text;
    bio : Text;
    location : Text;
    skills : Text;
    company : ?Text;
  };

  type JobType = { #fullTime; #internship };

  type JobPosting = {
    id : Nat;
    title : Text;
    description : Text;
    company : Text;
    location : Text;
    salary : ?Nat;
    jobType : JobType;
    skills : Text;
    postedDate : Time.Time;
    isActive : Bool;
    author : Principal;
  };

  type ApplicationStatus = {
    #pending;
    #reviewed;
    #accepted;
    #rejected;
  };

  type JobApplication = {
    id : Nat;
    jobId : Nat;
    applicant : Principal;
    coverLetter : Text;
    status : ApplicationStatus;
    submittedAt : Time.Time;
  };

  module JobPosting {
    public func compare(j1 : JobPosting, j2 : JobPosting) : Order.Order {
      if (j1.id < j2.id) { return #less };
      if (j1.id > j2.id) { return #greater };
      #equal;
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let jobPostings = Map.empty<Nat, JobPosting>();
  let jobApplications = Map.empty<Nat, JobApplication>();
  let savedJobs = Map.empty<Principal, Map.Map<Nat, ()>>();

  var nextJobId = 1;
  var nextApplicationId = 1;

  // Profile Management
  public shared ({ caller }) func createProfile(role : UserRole, name : Text, bio : Text, location : Text, skills : Text, company : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("Profile already exists") };
    let profile : UserProfile = {
      id = caller;
      role;
      name;
      bio;
      location;
      skills;
      company;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    // Public access - anyone can view user profiles in a job platform
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  // Job Management
  public shared ({ caller }) func createJob(title : Text, description : Text, company : Text, location : Text, salary : ?Nat, jobType : JobType, skills : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create jobs");
    };
    assertIsEmployer(caller);
    let job : JobPosting = {
      id = nextJobId;
      title;
      description;
      company;
      location;
      salary;
      jobType;
      skills;
      postedDate = Time.now();
      isActive = true;
      author = caller;
    };
    jobPostings.add(nextJobId, job);
    let jobId = nextJobId;
    nextJobId += 1;
    jobId;
  };

  public shared ({ caller }) func updateJobStatus(jobId : Nat, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update jobs");
    };
    assertIsEmployer(caller);
    switch (jobPostings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (job.author != caller) { Runtime.trap("Not authorized: You can only update your own job postings") };
        let updatedJob = { job with isActive };
        jobPostings.add(jobId, updatedJob);
      };
    };
  };

  public query ({ caller }) func searchJobs(keyword : Text) : async [JobPosting] {
    // Public access - anyone can search jobs
    jobPostings.values().toArray().filter(
      func(job) {
        job.isActive and (job.title.toLower().contains(#text(keyword.toLower())) or job.description.toLower().contains(#text(keyword.toLower())) or job.company.toLower().contains(#text(keyword.toLower())) or job.location.toLower().contains(#text(keyword.toLower())))
      }
    ).sort();
  };

  // Application Management
  public shared ({ caller }) func applyToJob(jobId : Nat, coverLetter : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply to jobs");
    };
    assertIsJobSeeker(caller);

    // Verify job exists
    switch (jobPostings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (not job.isActive) { Runtime.trap("Job is not active") };
      };
    };

    let app : JobApplication = {
      id = nextApplicationId;
      jobId;
      applicant = caller;
      coverLetter;
      status = #pending;
      submittedAt = Time.now();
    };

    jobApplications.add(nextApplicationId, app);
    let appId = nextApplicationId;
    nextApplicationId += 1;
    appId;
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, status : ApplicationStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update application status");
    };
    assertIsEmployer(caller);

    switch (jobApplications.get(applicationId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?application) {
        switch (jobPostings.get(application.jobId)) {
          case (null) { Runtime.trap("Job not found") };
          case (?job) {
            if (job.author != caller) { Runtime.trap("Not authorized: You can only update applications for your own job postings") };
            let updatedApp = { application with status };
            jobApplications.add(applicationId, updatedApp);
          };
        };
      };
    };
  };

  // Saved Jobs
  public shared ({ caller }) func saveJob(jobId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save jobs");
    };
    assertIsJobSeeker(caller);
    
    // Verify job exists
    switch (jobPostings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?_) { };
    };

    let userSavedJobs = switch (savedJobs.get(caller)) {
      case (null) {
        let newSet = Map.empty<Nat, ()>();
        savedJobs.add(caller, newSet);
        newSet;
      };
      case (?jobs) { jobs };
    };
    userSavedJobs.add(jobId, ());
  };

  public shared ({ caller }) func unsaveJob(jobId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unsave jobs");
    };
    assertIsJobSeeker(caller);
    switch (savedJobs.get(caller)) {
      case (null) { () };
      case (?userSavedJobs) { userSavedJobs.remove(jobId) };
    };
  };

  // Helper functions
  func assertIsJobSeeker(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role != #jobSeeker) { Runtime.trap("Not authorized: Only job seekers can perform this action") };
      };
    };
  };

  func assertIsEmployer(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role != #employer) { Runtime.trap("Not authorized: Only employers can perform this action") };
      };
    };
  };
};
