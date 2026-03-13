import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { JobType, useSearchJobs } from "../hooks/useQueries";
import type { JobPosting } from "../hooks/useQueries";

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

function JobCard({ job, index }: { job: JobPosting; index: number }) {
  const navigate = useNavigate();
  return (
    <Card
      className="card-hover cursor-pointer border-border bg-card"
      onClick={() =>
        navigate({ to: "/jobs/$id", params: { id: job.id.toString() } })
      }
      data-ocid={`landing.job.card.${index + 1}`}
    >
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <Badge
            variant="secondary"
            className={`shrink-0 text-xs ${
              job.jobType === JobType.internship
                ? "bg-accent/20 text-accent border-accent/30"
                : "bg-primary/20 text-primary border-primary/30"
            }`}
          >
            {job.jobType === JobType.internship ? "Internship" : "Full-time"}
          </Badge>
        </div>
        <h3 className="mb-1 font-display text-base font-semibold leading-tight line-clamp-2">
          {job.title}
        </h3>
        <p className="mb-3 text-sm font-medium text-primary">{job.company}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{job.location}</span>
        </div>
        {job.salary && (
          <p className="mt-2 text-sm font-semibold text-foreground">
            ${Number(job.salary).toLocaleString()}/yr
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {formatDate(job.postedDate)}
        </p>
      </CardContent>
    </Card>
  );
}

const SAMPLE_STATS = [
  { icon: Briefcase, label: "Active Jobs", value: "12,400+" },
  { icon: Building2, label: "Companies", value: "3,200+" },
  { icon: Users, label: "Job Seekers", value: "180,000+" },
  { icon: TrendingUp, label: "Placements", value: "24,000+" },
];

const FEATURED_CATEGORIES = [
  "Software Engineering",
  "Product Design",
  "Data Science",
  "Marketing",
  "Finance",
  "Healthcare",
  "Operations",
  "Legal",
];

const SKELETON_KEYS = [1, 2, 3, 4, 5, 6];

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useSearchJobs(searchTerm);

  const handleSearch = () => {
    if (query.trim()) {
      navigate({ to: "/jobs", search: { q: query } });
    } else {
      setSearchTerm("");
    }
  };

  const displayJobs = (jobs ?? []).slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 50%, oklch(0.78 0.22 145 / 0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.78 0.15 60 / 0.05) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.24 0.02 255 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.24 0.02 255 / 0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center gap-1.5 border-primary/20 bg-primary/10 px-3 py-1 text-primary"
            >
              <Sparkles className="h-3 w-3" />
              AI-Powered Job Discovery
            </Badge>
            <h1 className="font-display mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Find Your <span className="text-gradient">Dream Job</span>
              <br />
              With Precision
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Describe exactly what you&apos;re looking for in plain English.
              Our AI understands your ambitions and matches you with the perfect
              opportunities.
            </p>

            {/* AI Search Bar */}
            <div
              className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-2 shadow-glow"
              data-ocid="hero.search.panel"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <Input
                  placeholder="Describe your ideal job... e.g. 'Remote React engineer at a startup'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="border-0 bg-transparent text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-ocid="hero.search.input"
                />
                <Button
                  type="button"
                  onClick={handleSearch}
                  size="sm"
                  className="shrink-0 glow-primary-sm"
                  data-ocid="hero.search.button"
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {FEATURED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => navigate({ to: "/jobs", search: { q: cat } })}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  data-ocid="hero.category.button"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {SAMPLE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold md:text-3xl">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Latest Openings
              </h2>
              <p className="mt-2 text-muted-foreground">
                Fresh opportunities updated in real-time
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden md:flex"
            >
              <Link to="/jobs" data-ocid="landing.viewall.link">
                View all <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SKELETON_KEYS.map((k) => (
                <Skeleton
                  key={k}
                  className="h-48 rounded-xl"
                  data-ocid="landing.jobs.loading_state"
                />
              ))}
            </div>
          ) : displayJobs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"
              data-ocid="landing.jobs.empty_state"
            >
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">No jobs posted yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to post an opportunity
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/post-job" data-ocid="landing.postjob.button">
                  Post a Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayJobs.map((job, i) => (
                <JobCard key={job.id.toString()} job={job} index={i} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/jobs" data-ocid="landing.viewall.mobile.link">
                View all jobs <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-10 text-center md:p-16"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 50%, oklch(0.78 0.22 145 / 0.06) 0%, transparent 70%)",
            }}
          >
            <h2 className="font-display mb-4 text-3xl font-bold md:text-4xl">
              Ready to Land Your Next Role?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Join thousands of professionals who have found their dream jobs
              through JobSphere. Sign up free and start applying today.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="glow-primary">
                <Link to="/register" data-ocid="landing.cta.register.button">
                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/jobs" data-ocid="landing.cta.browse.button">
                  Browse Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
