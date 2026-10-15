"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { Zap, TrendingUp, Lock } from "lucide-react";
=======
import { ArrowLeft } from "lucide-react";
>>>>>>> 304d64b (Landing Page Added and Basic UI changed)

function friendlyError(code: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "That email already has an account. Try signing in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // If user is already logged in, redirect them to their active workspace
  useEffect(() => {
    if (authLoading || !user) return;
    if (!role) {
      router.replace("/onboarding");
    } else {
      router.replace(role === "buyer" ? "/buyer/dashboard" : "/seller/inbox");
    }
  }, [user, role, authLoading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const cred =
        mode === "signin"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);

      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const userRole = snap.exists() ? snap.data()?.role : null;

      if (!userRole) {
        router.replace("/onboarding");
      } else {
        router.replace(userRole === "buyer" ? "/buyer/dashboard" : "/seller/inbox");
      }
    } catch (err: any) {
      toast.error(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <div className="hidden md:block">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">B</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                BidBridge
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Smart B2B Procurement
            </h1>
            <p className="text-xl text-gray-600">
              Connect with buyers and sellers. Post RFQs with AI. Get competitive bids instantly.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Fast & Easy</h3>
                <p className="text-gray-600 text-sm">Create RFQs with voice or text. AI handles the rest.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Real-Time Bids</h3>
                <p className="text-gray-600 text-sm">Watch offers arrive. Compare & award instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Secure & Trusted</h3>
                <p className="text-gray-600 text-sm">Enterprise-grade security for your transactions.</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-8 border-t border-amber-200">
            <div className="flex gap-8">
              <div>
                <div className="text-2xl font-bold text-amber-700">50K+</div>
                <p className="text-sm text-gray-600">Active Traders</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-700">2M+</div>
                <p className="text-sm text-gray-600">RFQs Posted</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-700">92%</div>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div>
          <Card className="shadow-xl border-amber-200">
            <CardHeader className="bg-gradient-to-br from-amber-50 to-white border-b border-amber-200">
              <CardTitle className="text-2xl">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {mode === "signin"
                  ? "Sign in to access your dashboard"
                  : "Join BidBridge to start trading"}
              </p>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <p className="text-xs text-gray-500">
                    {mode === "signup" && "Minimum 6 characters"}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-200 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {busy
                    ? "Please wait..."
                    : mode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                </Button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-6 pt-6 border-t border-amber-200">
                <p className="text-center text-gray-600 text-sm mb-4">
                  {mode === "signin"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </p>
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="w-full py-2 px-4 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-all font-medium"
                >
                  {mode === "signin" ? "Create Account" : "Sign In"}
                </button>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-gray-600 text-center">
                  ✓ Secure login powered by Firebase
                  <br />✓ Your data is always protected
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile BidBridge Info */}
          <div className="md:hidden mt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                BidBridge
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              AI-powered B2B marketplace for procurement
            </p>
          </div>
        </div>
=======
    <main className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <div className="w-full max-w-sm space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="size-3.5" />
          Back to BidBridge Home
        </Link>

        <Card className="shadow-sm border-border">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="grid h-6 w-6 place-items-center rounded bg-primary text-primary-foreground font-bold text-xs">
                B
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">BidBridge</span>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full font-semibold shadow-xs" disabled={busy}>
                {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <button
              type="button"
              className="mt-4 text-xs text-muted-foreground hover:text-foreground underline block"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>

            <p className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
              Describe what you need. Get verified bids. Pick the best one.
            </p>
          </CardContent>
        </Card>
>>>>>>> 304d64b (Landing Page Added and Basic UI changed)
      </div>
    </main>
  );
}