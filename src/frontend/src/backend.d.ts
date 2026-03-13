import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface JobPosting {
    id: bigint;
    title: string;
    salary?: bigint;
    jobType: JobType;
    postedDate: Time;
    description: string;
    isActive: boolean;
    author: Principal;
    company: string;
    skills: string;
    location: string;
}
export interface UserProfile {
    id: Principal;
    bio: string;
    name: string;
    role: UserRole;
    company?: string;
    skills: string;
    location: string;
}
export enum ApplicationStatus {
    pending = "pending",
    rejected = "rejected",
    reviewed = "reviewed",
    accepted = "accepted"
}
export enum JobType {
    internship = "internship",
    fullTime = "fullTime"
}
export enum UserRole {
    employer = "employer",
    jobSeeker = "jobSeeker"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    applyToJob(jobId: bigint, coverLetter: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createJob(title: string, description: string, company: string, location: string, salary: bigint | null, jobType: JobType, skills: string): Promise<bigint>;
    createProfile(role: UserRole, name: string, bio: string, location: string, skills: string, company: string | null): Promise<void>;
    getCallerProfile(): Promise<UserProfile>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveJob(jobId: bigint): Promise<void>;
    searchJobs(keyword: string): Promise<Array<JobPosting>>;
    unsaveJob(jobId: bigint): Promise<void>;
    updateApplicationStatus(applicationId: bigint, status: ApplicationStatus): Promise<void>;
    updateJobStatus(jobId: bigint, isActive: boolean): Promise<void>;
}
