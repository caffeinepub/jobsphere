import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Briefcase, Building2, MapPin, Search, Zap } from "lucide-react";
import { useState } from "react";
import { JobType, useSearchJobs } from "../hooks/useQueries";
import type { JobPosting } from "../hooks/useQueries";

const SKELETON_KEYS = [1, 2, 3, 4, 5, 6];

function formatDate(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  const d = new Date(ms);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function JobListCard({ job, index }: { job: JobPosting; index: number }) {
  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id.toString() }}
      data-ocid={`jobs.item.${index + 1}`}
    >
      <Card className="card-hover border-border bg-card">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-sm font-medium text-primary">
                    {job.company}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-xs ${
                    job.jobType === JobType.internship
                      ? "border-accent/30 bg-accent/20 text-accent"
                      : "border-primary/30 bg-primary/20 text-primary"
                  }`}
                >
                  {job.jobType === JobType.internship
                    ? "Internship"
                    : "Full-time"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {job.location}
                </span>
                {job.salary && (
                  <span className="font-semibold text-foreground">
                    ${Number(job.salary).toLocaleString()}/yr
                  </span>
                )}
                <span>{formatDate(job.postedDate)}</span>
              </div>
              {job.skills && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills
                    .split(",")
                    .slice(0, 4)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function JobsPage() {
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.q ?? "");
  const [activeSearch, setActiveSearch] = useState(searchParams.q ?? "");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "fullTime" | "internship"
  >("all");

  const { data: jobs, isLoading } = useSearchJobs(activeSearch);

  const filtered = (jobs ?? []).filter((j: JobPosting) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "fullTime") return j.jobType === JobType.fullTime;
    return j.jobType === JobType.internship;
  });

  const handleSearch = () => {
    setActiveSearch(query);
    navigate({ to: "/jobs", search: query ? { q: query } : {} });
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Browse Jobs
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover your next opportunity
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by title, skill, company..."
            className="pl-9"
            data-ocid="jobs.search.input"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          data-ocid="jobs.search.button"
        >
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      <div className="mb-6">
        <Tabs
          value={typeFilter}
          onValueChange={(v) =>
            setTypeFilter(v as "all" | "fullTime" | "internship")
          }
        >
          <TabsList className="bg-secondary">
            <TabsTrigger value="all" data-ocid="jobs.filter.all.tab">
              All Jobs
            </TabsTrigger>
            <TabsTrigger value="fullTime" data-ocid="jobs.filter.fulltime.tab">
              Full-time
            </TabsTrigger>
            <TabsTrigger
              value="internship"
              data-ocid="jobs.filter.internship.tab"
            >
              Internships
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!isLoading && (
        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
          {activeSearch ? ` for "${activeSearch}"` : ""}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {SKELETON_KEYS.map((k) => (
            <Skeleton
              key={k}
              className="h-28 rounded-xl"
              data-ocid="jobs.loading_state"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"
          data-ocid="jobs.empty_state"
        >
          <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">No jobs found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try different keywords or clear the search
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQuery("");
              setActiveSearch("");
            }}
            data-ocid="jobs.clear.button"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job: JobPosting, i: number) => (
            <JobListCard key={job.id.toString()} job={job} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
