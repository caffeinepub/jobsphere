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
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Building2, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  UserRole,
  useCallerProfile,
  useCreateProfile,
} from "../hooks/useQueries";

export default function RegisterPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const createProfile = useCreateProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState<"auth" | "profile">("auth");
  const [role, setRole] = useState<UserRole>(UserRole.jobSeeker);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (identity && !profileLoading) {
      if (profile) {
        navigate({ to: "/dashboard" });
      } else {
        setStep("profile");
      }
    }
  }, [identity, profile, profileLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await createProfile.mutateAsync({
        role,
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        skills: skills.trim(),
        company: role === UserRole.employer ? company.trim() : null,
      });
      toast.success("Profile created! Welcome to JobSphere.");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  if (step === "auth") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">
              Join <span className="text-gradient">JobSphere</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your account to get started
            </p>
          </div>
          <Card
            className="border-border bg-card"
            data-ocid="register.auth.panel"
          >
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Create Account
              </CardTitle>
              <CardDescription>
                First, connect your Internet Identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full glow-primary-sm"
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="register.connect.button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  "Connect Internet Identity"
                )}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                  data-ocid="register.login.link"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about yourself to get started
          </p>
        </div>

        <Card
          className="border-border bg-card"
          data-ocid="register.profile.panel"
        >
          <CardHeader>
            <CardTitle className="font-display text-lg">Account Type</CardTitle>
            <CardDescription>How will you use JobSphere?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.jobSeeker)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  role === UserRole.jobSeeker
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40"
                }`}
                data-ocid="register.jobseeker.toggle"
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-semibold">Job Seeker</span>
                <span className="text-xs opacity-70">Find opportunities</span>
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.employer)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  role === UserRole.employer
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40"
                }`}
                data-ocid="register.employer.toggle"
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-semibold">Employer</span>
                <span className="text-xs opacity-70">Post jobs &amp; hire</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  data-ocid="register.name.input"
                />
              </div>

              {role === UserRole.employer && (
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    data-ocid="register.company.input"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  data-ocid="register.location.input"
                />
              </div>

              {role === UserRole.jobSeeker && (
                <div className="space-y-1.5">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript, Node.js"
                    data-ocid="register.skills.input"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                  data-ocid="register.bio.textarea"
                />
              </div>

              <Button
                type="submit"
                className="w-full glow-primary-sm"
                disabled={createProfile.isPending}
                data-ocid="register.submit_button"
              >
                {createProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                    profile...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
