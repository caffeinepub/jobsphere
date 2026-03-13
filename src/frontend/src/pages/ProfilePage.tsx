import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Building2, Edit2, Loader2, MapPin, Save, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  UserRole,
  useCallerProfile,
  useSaveCallerProfile,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useCallerProfile();
  const saveProfile = useSaveCallerProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setLocation(profile.location);
      setSkills(profile.skills);
      setCompany(profile.company ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      await saveProfile.mutateAsync({
        ...profile,
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        skills: skills.trim(),
        company: company.trim() || undefined,
      });
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setLocation(profile.location);
      setSkills(profile.skills);
      setCompany(profile.company ?? "");
    }
    setEditing(false);
  };

  if (!identity) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">
          Please sign in to view your profile
        </p>
        <Button asChild className="mt-4">
          <Link to="/login" data-ocid="profile.login.button">
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10" data-ocid="profile.loading_state">
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="container flex flex-col items-center justify-center py-24 text-center"
        data-ocid="profile.empty_state"
      >
        <p className="text-lg font-medium">No profile found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete registration to create your profile
        </p>
        <Button asChild className="mt-4">
          <Link to="/register" data-ocid="profile.register.button">
            Complete Registration
          </Link>
        </Button>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const skillList = profile.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isEmployer = profile.role === UserRole.employer;

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header Card */}
        <Card className="border-border bg-card" data-ocid="profile.panel">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-display text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-2 font-display text-xl font-bold"
                    data-ocid="profile.name.input"
                  />
                ) : (
                  <h1 className="font-display text-2xl font-bold">
                    {profile.name}
                  </h1>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      isEmployer
                        ? "bg-accent/20 text-accent border-accent/30"
                        : "bg-primary/20 text-primary border-primary/30"
                    }
                  >
                    {isEmployer ? (
                      <>
                        <Building2 className="mr-1 h-3 w-3" /> Employer
                      </>
                    ) : (
                      <>
                        <User className="mr-1 h-3 w-3" /> Job Seeker
                      </>
                    )}
                  </Badge>
                  {profile.location && !editing && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.location}
                    </span>
                  )}
                  {isEmployer && profile.company && !editing && (
                    <span className="text-sm text-muted-foreground">
                      {profile.company}
                    </span>
                  )}
                </div>
                {editing && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="p-location" className="text-xs">
                        Location
                      </Label>
                      <Input
                        id="p-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        data-ocid="profile.location.input"
                      />
                    </div>
                    {isEmployer && (
                      <div className="space-y-1">
                        <Label htmlFor="p-company" className="text-xs">
                          Company
                        </Label>
                        <Input
                          id="p-company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Company name"
                          data-ocid="profile.company.input"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {editing ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      data-ocid="profile.cancel_button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saveProfile.isPending}
                      className="glow-primary-sm"
                      data-ocid="profile.save_button"
                    >
                      {saveProfile.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(true)}
                    data-ocid="profile.edit_button"
                  >
                    <Edit2 className="mr-1.5 h-4 w-4" /> Edit
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                data-ocid="profile.bio.textarea"
              />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {profile.bio || "No bio added yet."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Skills (job seekers) */}
        {!isEmployer && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="p-skills"
                    className="text-xs text-muted-foreground"
                  >
                    Comma-separated
                  </Label>
                  <Input
                    id="p-skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript, Node.js"
                    data-ocid="profile.skills.input"
                  />
                </div>
              ) : skillList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-muted text-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills added yet.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Principal */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Principal ID
                </p>
                <p className="mt-1 font-mono text-xs text-foreground/70 break-all">
                  {profile.id.toString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
