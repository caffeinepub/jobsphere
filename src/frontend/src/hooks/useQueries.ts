import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicationStatus, JobType, UserRole } from "../backend.d";
import type { JobPosting, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export type { JobPosting, UserProfile };
export { ApplicationStatus, JobType, UserRole };

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const profile = await actor.getCallerUserProfile();
        return profile ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchJobs(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<JobPosting[]>({
    queryKey: ["jobs", keyword],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchJobs(keyword);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      role: UserRole;
      name: string;
      bio: string;
      location: string;
      skills: string;
      company: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProfile(
        args.role,
        args.name,
        args.bio,
        args.location,
        args.skills,
        args.company,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      description: string;
      company: string;
      location: string;
      salary: bigint | null;
      jobType: JobType;
      skills: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createJob(
        args.title,
        args.description,
        args.company,
        args.location,
        args.salary,
        args.jobType,
        args.skills,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { jobId: bigint; coverLetter: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.applyToJob(args.jobId, args.coverLetter);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useSaveJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveJob(jobId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUnsaveJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.unsaveJob(jobId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateJobStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { jobId: bigint; isActive: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateJobStatus(args.jobId, args.isActive);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      applicationId: bigint;
      status: ApplicationStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateApplicationStatus(args.applicationId, args.status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}
