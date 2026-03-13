import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export default function Navbar() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!identity;

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">
            Job<span className="text-gradient">Sphere</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            data-ocid="nav.jobs.link"
          >
            Browse Jobs
          </Link>
          {isLoggedIn && (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                data-ocid="nav.dashboard.link"
              >
                Dashboard
              </Link>
              <Link
                to="/post-job"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                data-ocid="nav.postjob.link"
              >
                Post a Job
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  data-ocid="nav.user.button"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                data-ocid="nav.user.dropdown_menu"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2"
                    data-ocid="nav.profile.link"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2"
                    data-ocid="nav.dashboard.menu.link"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/post-job"
                    className="flex items-center gap-2"
                    data-ocid="nav.postjob.menu.link"
                  >
                    <Plus className="h-4 w-4" /> Post a Job
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => clear()}
                  className="text-destructive focus:text-destructive flex items-center gap-2"
                  data-ocid="nav.logout.button"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="nav.login.button"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
              <Button size="sm" asChild className="glow-primary-sm">
                <Link to="/register" data-ocid="nav.register.button">
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-ocid="nav.mobile.toggle"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              to="/jobs"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.mobile.jobs.link"
            >
              Browse Jobs
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="nav.mobile.dashboard.link"
                >
                  Dashboard
                </Link>
                <Link
                  to="/post-job"
                  className="text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="nav.mobile.postjob.link"
                >
                  Post a Job
                </Link>
                <Link
                  to="/profile"
                  className="text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="nav.mobile.profile.link"
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clear();
                    setMobileOpen(false);
                  }}
                  className="justify-start px-0"
                  data-ocid="nav.mobile.logout.button"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    login();
                    setMobileOpen(false);
                  }}
                  data-ocid="nav.mobile.login.button"
                >
                  Sign In
                </Button>
                <Button size="sm" asChild>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    data-ocid="nav.mobile.register.button"
                  >
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
