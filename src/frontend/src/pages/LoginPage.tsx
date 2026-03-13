import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Loader2, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, identity, isLoggingIn, isLoginError } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) navigate({ to: "/dashboard" });
  }, [identity, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">
            Welcome to <span className="text-gradient">JobSphere</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your account and opportunities
          </p>
        </div>

        <Card className="border-border bg-card" data-ocid="login.panel">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl">Sign In</CardTitle>
            <CardDescription>
              Connect securely with Internet Identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoginError && (
              <div
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="login.error_state"
              >
                Login failed. Please try again.
              </div>
            )}

            <Button
              className="w-full glow-primary-sm"
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="login.submit_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Continue with Internet Identity
                </>
              )}
            </Button>

            <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                What is Internet Identity?
              </p>
              <p>
                A secure, decentralized authentication system built on the
                Internet Computer. No passwords — just your device&apos;s
                biometrics or security key.
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
                data-ocid="login.register.link"
              >
                Create one free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
