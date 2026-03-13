import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { JobType, useCreateJob } from "../hooks/useQueries";

export default function PostJobPage() {
  const { identity } = useInternetIdentity();
  const createJob = useCreateJob();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState<JobType>(JobType.fullTime);
  const [skills, setSkills] = useState("");

  if (!identity) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">Sign in to post a job</p>
        <Button asChild className="mt-4">
          <Link to="/login" data-ocid="postjob.login.button">
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !description.trim() ||
      !company.trim() ||
      !location.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const salaryBigInt = salary ? BigInt(Math.round(Number(salary))) : null;
      await createJob.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salaryBigInt,
        jobType,
        skills: skills.trim(),
      });
      toast.success("Job posted successfully!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to post job. Please try again.");
    }
  };

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Post a Job
          </h1>
          <p className="mt-2 text-muted-foreground">
            Reach thousands of qualified candidates
          </p>
        </div>

        <Card className="border-border bg-card" data-ocid="postjob.panel">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Job Details
            </CardTitle>
            <CardDescription>Fields marked * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senior React Engineer"
                    required
                    data-ocid="postjob.title.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    required
                    data-ocid="postjob.company.input"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA / Remote"
                    required
                    data-ocid="postjob.location.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="salary">Annual Salary (USD)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="120000"
                    min="0"
                    data-ocid="postjob.salary.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select
                  value={jobType}
                  onValueChange={(v) => setJobType(v as JobType)}
                >
                  <SelectTrigger data-ocid="postjob.jobtype.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JobType.fullTime}>Full-time</SelectItem>
                    <SelectItem value={JobType.internship}>
                      Internship
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="skills">
                  Required Skills (comma-separated)
                </Label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js, GraphQL"
                  data-ocid="postjob.skills.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, requirements, and benefits..."
                  rows={8}
                  required
                  data-ocid="postjob.description.textarea"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/dashboard" })}
                  data-ocid="postjob.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 glow-primary-sm"
                  disabled={createJob.isPending}
                  data-ocid="postjob.submit_button"
                >
                  {createJob.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Posting...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
