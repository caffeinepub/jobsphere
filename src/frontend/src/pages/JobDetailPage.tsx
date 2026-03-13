import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  Send,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  JobType,
  useApplyToJob,
  useSaveJob,
  useSearchJobs,
  useUnsaveJob,
} from "../hooks/useQueries";

function formatDate(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function JobDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: jobs, isLoading } = useSearchJobs("");
  const applyMutation = useApplyToJob();
  const saveMutation = useSaveJob();
  const unsaveMutation = useUnsaveJob();

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [saved, setSaved] = useState(false);

  const job = jobs?.find((j) => j.id.toString() === id);

  const handleApply = async () => {
    if (!identity) {
      toast.error("Please sign in to apply");
      return;
    }
    try {
      await applyMutation.mutateAsync({ jobId: job!.id, coverLetter });
      toast.success("Application submitted successfully!");
      setApplyOpen(false);
      setCoverLetter("");
    } catch {
      toast.error("Failed to submit application");
    }
  };

  const handleSaveToggle = async () => {
    if (!identity) {
      toast.error("Please sign in to save jobs");
      return;
    }
    try {
      if (saved) {
        await unsaveMutation.mutateAsync(job!.id);
        setSaved(false);
        toast.success("Job removed from saved");
      } else {
        await saveMutation.mutateAsync(job!.id);
        setSaved(true);
        toast.success("Job saved!");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10" data-ocid="jobdetail.loading_state">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-6 h-12 w-2/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div
        className="container flex flex-col items-center justify-center py-24 text-center"
        data-ocid="jobdetail.error_state"
      >
        <p className="text-lg font-medium">Job not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/jobs" })}
          data-ocid="jobdetail.back.button"
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Jobs
        </Button>
      </div>
    );
  }

  const skills = job.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="container py-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/jobs" })}
        className="mb-6"
        data-ocid="jobdetail.back.button"
      >
        <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Jobs
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary ring-1 ring-border">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold md:text-3xl">
                {job.title}
              </h1>
              <p className="mt-1 text-lg font-semibold text-primary">
                {job.company}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(job.postedDate)}
                </span>
              </div>
            </div>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h2 className="font-display mb-4 text-xl font-semibold">
                Job Description
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-foreground/80">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {skills.length > 0 && (
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <h2 className="font-display mb-4 text-xl font-semibold">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-muted text-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20 border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="secondary"
                    className={
                      job.jobType === JobType.internship
                        ? "border-accent/30 bg-accent/20 text-accent"
                        : "border-primary/30 bg-primary/20 text-primary"
                    }
                  >
                    {job.jobType === JobType.internship
                      ? "Internship"
                      : "Full-time"}
                  </Badge>
                  {job.isActive ? (
                    <Badge
                      variant="secondary"
                      className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      Closed
                    </Badge>
                  )}
                </div>

                {job.salary && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      ${Number(job.salary).toLocaleString()}/yr
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Posted {formatDate(job.postedDate)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full glow-primary-sm"
                      disabled={!job.isActive}
                      data-ocid="jobdetail.apply.open_modal_button"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {job.isActive ? "Apply Now" : "Applications Closed"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="border-border bg-card"
                    data-ocid="jobdetail.apply.dialog"
                  >
                    <DialogHeader>
                      <DialogTitle className="font-display">
                        Apply for {job.title}
                      </DialogTitle>
                      <DialogDescription>at {job.company}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <Label htmlFor="coverLetter">Cover Letter</Label>
                      <Textarea
                        id="coverLetter"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Tell us why you're a great fit for this role..."
                        rows={6}
                        data-ocid="jobdetail.apply.textarea"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setApplyOpen(false)}
                        data-ocid="jobdetail.apply.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApply}
                        disabled={applyMutation.isPending}
                        data-ocid="jobdetail.apply.submit_button"
                      >
                        {applyMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveToggle}
                  disabled={saveMutation.isPending || unsaveMutation.isPending}
                  data-ocid="jobdetail.save.toggle"
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />{" "}
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-2 h-4 w-4" /> Save Job
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
