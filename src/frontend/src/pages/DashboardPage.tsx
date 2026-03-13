import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  MapPin,
  Plus,
  ToggleLeft,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  JobType,
  UserRole,
  useCallerProfile,
  useSearchJobs,
  useUpdateJobStatus,
} from "../hooks/useQueries";
import type { JobPosting } from "../hooks/useQueries";

const SKELETON_KEYS = [1, 2, 3];

function formatDate(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EmployerDashboard() {
  const { data: jobs, isLoading } = useSearchJobs("");
  const updateStatus = useUpdateJobStatus();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const myJobs = (jobs ?? []).filter(
    (j: JobPosting) =>
      j.author.toString() === identity?.getPrincipal().toString(),
  );

  const handleToggleActive = async (job: JobPosting) => {
    try {
      await updateStatus.mutateAsync({
        jobId: job.id,
        isActive: !job.isActive,
      });
      toast.success(`Job ${job.isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update job status");
    }
  };

  return (
    <Tabs defaultValue="postings">
      <TabsList className="mb-6 bg-secondary">
        <TabsTrigger
          value="postings"
          data-ocid="dashboard.employer.postings.tab"
        >
          My Job Postings
        </TabsTrigger>
        <TabsTrigger
          value="applications"
          data-ocid="dashboard.employer.applications.tab"
        >
          Applications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="postings">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {myJobs.length} posting{myJobs.length !== 1 ? "s" : ""}
          </p>
          <Button size="sm" asChild className="glow-primary-sm">
            <Link to="/post-job" data-ocid="dashboard.postjob.button">
              <Plus className="mr-1.5 h-4 w-4" /> Post New Job
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3" data-ocid="dashboard.jobs.loading_state">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : myJobs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center"
            data-ocid="dashboard.jobs.empty_state"
          >
            <Briefcase className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No jobs posted yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first job listing
            </p>
            <Button size="sm" asChild className="mt-4">
              <Link to="/post-job" data-ocid="dashboard.empty.postjob.button">
                Post a Job
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {myJobs.map((job: JobPosting, i: number) => (
              <Card
                key={job.id.toString()}
                className="border-border bg-card"
                data-ocid={`dashboard.job.item.${i + 1}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/jobs/$id"
                          params={{ id: job.id.toString() }}
                          className="font-display font-semibold transition-colors hover:text-primary"
                          data-ocid={`dashboard.job.link.${i + 1}`}
                        >
                          {job.title}
                        </Link>
                        <Badge
                          variant="secondary"
                          className={
                            job.jobType === JobType.internship
                              ? "border-accent/30 bg-accent/20 text-accent text-xs"
                              : "border-primary/30 bg-primary/20 text-primary text-xs"
                          }
                        >
                          {job.jobType === JobType.internship
                            ? "Internship"
                            : "Full-time"}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span>Posted {formatDate(job.postedDate)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={job.isActive}
                        onCheckedChange={() => handleToggleActive(job)}
                        disabled={updateStatus.isPending}
                        data-ocid={`dashboard.job.toggle.${i + 1}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="applications">
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center"
          data-ocid="dashboard.applications.panel"
        >
          <ToggleLeft className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">Application management</p>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage applications through individual job listings
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate({ to: "/jobs" })}
            data-ocid="dashboard.browse.button"
          >
            Browse Your Jobs
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function SeekerDashboard() {
  return (
    <Tabs defaultValue="applications">
      <TabsList className="mb-6 bg-secondary">
        <TabsTrigger
          value="applications"
          data-ocid="dashboard.seeker.applications.tab"
        >
          My Applications
        </TabsTrigger>
        <TabsTrigger value="saved" data-ocid="dashboard.seeker.saved.tab">
          Saved Jobs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="applications">
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center"
          data-ocid="dashboard.applications.empty_state"
        >
          <Briefcase className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">No applications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start applying to jobs to track your progress
          </p>
          <Button size="sm" asChild className="mt-4">
            <Link to="/jobs" data-ocid="dashboard.seeker.browse.button">
              Browse Jobs
            </Link>
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="saved">
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center"
          data-ocid="dashboard.saved.empty_state"
        >
          <Briefcase className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">No saved jobs</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save interesting jobs to review later
          </p>
          <Button size="sm" asChild className="mt-4">
            <Link to="/jobs" data-ocid="dashboard.seeker.saved.browse.button">
              Browse Jobs
            </Link>
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useCallerProfile();

  if (!identity) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">
          Please sign in to access your dashboard
        </p>
        <Button asChild className="mt-4">
          <Link to="/login" data-ocid="dashboard.login.button">
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10" data-ocid="dashboard.loading_state">
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="mb-8 h-4 w-64" />
        <Skeleton className="h-12 w-64" />
        <div className="mt-6 space-y-3">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">Complete your profile first</p>
        <Button asChild className="mt-4">
          <Link to="/register" data-ocid="dashboard.register.button">
            Complete Registration
          </Link>
        </Button>
      </div>
    );
  }

  const isEmployer = profile.role === UserRole.employer;

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              {isEmployer ? (
                <Building2 className="h-6 w-6 text-primary" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                Welcome, {profile.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEmployer
                  ? `${profile.company ?? ""} · Employer`
                  : "Job Seeker"}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/profile" data-ocid="dashboard.profile.button">
            Edit Profile
          </Link>
        </Button>
      </div>

      {isEmployer ? <EmployerDashboard /> : <SeekerDashboard />}
    </div>
  );
}
