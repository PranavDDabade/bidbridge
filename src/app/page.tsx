"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  Building2,
  Check,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const { user, role, name, loading, logout } = useAuth();
  const router = useRouter();

  const dashboardHref =
    role === "buyer"
      ? "/buyer/dashboard"
      : role === "seller"
      ? "/seller/inbox"
      : "/onboarding";

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-foreground">
      {/* ─── NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link
            href="/"
            id="brand-logo"
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-extrabold text-base shadow-xs">
              B
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                BidBridge
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[10px] font-medium tracking-normal text-muted-foreground border-border bg-secondary"
              >
                AI RFQ Marketplace
              </Badge>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pipeline" className="hover:text-foreground transition-colors">
              AI Grounding
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:inline text-xs text-muted-foreground font-medium">
                  Signed in as <strong className="text-foreground">{name || user.email?.split("@")[0]}</strong>
                </span>
                {role && (
                  <Badge variant="secondary" className="capitalize text-xs">
                    {role}
                  </Badge>
                )}
                <Button asChild size="sm" id="nav-dashboard-btn" className="gap-1.5 shadow-xs">
                  <Link href={dashboardHref}>
                    Dashboard
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  id="nav-logout-btn"
                  onClick={async () => {
                    await logout();
                    router.refresh();
                  }}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" id="nav-signin-btn">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" id="nav-signup-btn" className="shadow-xs">
                  <Link href="/login">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/60 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(183,121,54,0.12),rgba(255,254,250,0))]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
              {/* Badge Announcement */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-foreground shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-primary">Gemini Flash AI</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Voice & Text RFQ Marketplace</span>
              </div>

              {/* H1 Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
                Request quotes in plain language.{" "}
                <span className="text-primary block mt-1">Compare bids in real time.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                The modern B2B procurement marketplace connecting project buyers with verified suppliers.
                Speak or type requirements, let AI extract line items with instant confidence scoring, and award deals in minutes.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  id="hero-primary-cta"
                  className="w-full sm:w-auto px-6 h-11 text-sm font-semibold shadow-sm gap-2"
                >
                  <Link href={user ? (role === "buyer" ? "/buyer/rfq/new" : dashboardHref) : "/login"}>
                    <Mic className="size-4" />
                    {user ? "Post a New Request" : "Post an RFQ (Buyer)"}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  id="hero-secondary-cta"
                  className="w-full sm:w-auto px-6 h-11 text-sm font-semibold border-border gap-2 bg-card hover:bg-muted"
                >
                  <Link href={user ? dashboardHref : "/login"}>
                    <Building2 className="size-4" />
                    {user ? "Open Inbox" : "Browse RFQs (Seller)"}
                  </Link>
                </Button>
              </div>

              {/* Verified Trust Strip */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" /> Real-time Firestore sync
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Bot className="size-3.5 text-primary" /> Gemini AI grounding
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Advanced ABAC security
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> Instant 1-click award
                </span>
              </div>
            </div>

            {/* ─── LIVE PROCUREMENT PREVIEW CARD ─── */}
            <div className="mt-12 md:mt-16 relative mx-auto max-w-4xl">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-amber-200/20 to-primary/10 blur-xl opacity-75" />
              <Card className="relative border-border shadow-lg bg-card overflow-hidden">
                <div className="border-b border-border bg-secondary/60 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-xs font-semibold tracking-wide uppercase text-foreground">
                      Live Marketplace Activity
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                      94% AI Confidence
                    </Badge>
                    <span className="hidden sm:inline">• Grounding Verified</span>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* RFQ Header Block */}
                  <div className="bg-secondary/40 rounded-xl p-4 border border-border/80">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px] bg-background">RFQ #4092</Badge>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] hover:bg-amber-100">
                            Open for Bidding
                          </Badge>
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-foreground">
                          500 Bags UltraTech 53-Grade OPC Cement & 10 Tons TMT Rebar (Fe-550D)
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Posted by <strong className="text-foreground">Apex Infrastructure Ltd</strong> • Needed by: <span className="font-medium text-foreground">Oct 20, 2026</span> • Location: <span className="font-medium text-foreground">Pune, Maharashtra</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Voice Input Transcribed</span>
                        <span className="text-xs font-mono text-emerald-600 font-semibold">✓ 0 Hallucinations</span>
                      </div>
                    </div>
                  </div>

                  {/* Bids List Preview */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                      <span>Real-Time Bids from Verified Suppliers</span>
                      <span>3 Bids Received</span>
                    </div>

                    {/* Bid 1 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary font-bold text-sm">
                          W
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Western Building Materials</span>
                            <Badge className="bg-emerald-600 text-white text-[10px] h-4 px-1.5 font-semibold">
                              Best Value
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Lead time: <strong className="text-foreground">2 days</strong> • Includes on-site unloading and lab test certificate
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="text-base font-bold text-foreground">₹2,45,000</div>
                          <span className="text-[11px] text-muted-foreground">All taxes included</span>
                        </div>
                        <Button size="sm" className="h-8 text-xs font-semibold">
                          Award Deal
                        </Button>
                      </div>
                    </div>

                    {/* Bid 2 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-foreground font-bold text-sm">
                          M
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">Metro Steel & Aggregates</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Lead time: <strong className="text-foreground">3 days</strong> • Standard dispatch via 16-wheel truck
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="text-base font-bold text-foreground">₹2,52,000</div>
                          <span className="text-[11px] text-muted-foreground">Standard terms</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Details
                        </Button>
                      </div>
                    </div>

                    {/* Bid 3 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-foreground font-bold text-sm">
                          N
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">National Cement Traders</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Lead time: <strong className="text-foreground">4 days</strong> • Direct mill dispatch
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="text-base font-bold text-foreground">₹2,49,500</div>
                          <span className="text-[11px] text-muted-foreground">Net 15 days</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS (3 STEPS) ─── */}
        <section id="how-it-works" className="py-16 md:py-24 border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 md:mb-16">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30">
                Simple Workflow
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How BidBridge works
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                From voice recording to awarded contract in three transparent steps.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base">
                      01
                    </span>
                    <Mic className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Speak or Type Your RFQ</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Use browser-native speech recognition or plain text. Describe quantities, grades, location, and needed-by date naturally.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" /> Editable live transcript before submission
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base">
                      02
                    </span>
                    <Bot className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">AI Parses & Scores Confidence</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Google Gemini extracts itemized tables and validates realistic bounds. A secondary grounding pass catches hallucinations before posting.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" /> 0-100% per-field confidence rating
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base">
                      03
                    </span>
                    <CheckCircle2 className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Receive Bids & 1-Click Award</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Verified suppliers submit quotes with transparent lead times. Compare competing offers in real time and select the winner instantly.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" /> Instant notification & audit freeze
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DUAL ROLE FEATURES (BUYERS & SELLERS) ─── */}
        <section id="features" className="py-16 md:py-24 border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 md:mb-16">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30">
                Tailored Workflows
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built for both buyers and suppliers
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Dedicated interfaces optimized for procurement managers and sales executives.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* For Buyers */}
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
                    FOR BUYERS
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Never fill repetitive RFQ forms again</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Procure materials faster with natural language processing and real-time vendor competition.
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>Hands-Free Voice RFQs:</strong> Dictate material requests on the go with instant Web Speech transcription.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>AI Structured Parsing:</strong> Gemini extracts line items, quantities, and units into structured tables.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>Confidence Transparency:</strong> Color-coded badges show exactly how reliable each extracted field is.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>Edit Before Bids Arrive:</strong> Flexible updates to RFQs before sellers submit proposals.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <Button asChild className="w-full sm:w-auto gap-2">
                    <Link href={user ? "/buyer/dashboard" : "/login"}>
                      Explore Buyer Dashboard
                      <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* For Sellers */}
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1 text-xs font-bold text-foreground mb-4 border border-border">
                    FOR SELLERS & SUPPLIERS
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Discover verified RFQs in real time</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Expand your order book without cold sales. Respond quickly to live, qualified buyer inquiries.
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>Live Opportunity Feed:</strong> Instant Firestore synchronization brings new RFQs straight to your inbox.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>Lead Time & Price Clarity:</strong> Submit quote pricing, delivery timelines, and special terms in seconds.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>Transparent Competition:</strong> Update bids while the RFQ is open to remain competitive.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span><strong>Deal Status Tracking:</strong> Direct alerts when your quote is awarded by the procurement lead.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <Button asChild variant="outline" className="w-full sm:w-auto gap-2 bg-card hover:bg-muted border-border">
                    <Link href={user ? "/seller/inbox" : "/login"}>
                      Explore Seller Inbox
                      <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── AI GROUNDING PIPELINE ─── */}
        <section id="pipeline" className="py-16 md:py-24 border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 md:mb-16">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30">
                AI Architecture
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                4-Stage Hallucination-Resistant Pipeline
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                B2B procurement requires 100% data fidelity. Here is how BidBridge ensures high reliability before storing RFQs.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-primary mb-2">
                  <Bot className="size-4" /> Stage 1: Extraction
                </div>
                <h4 className="font-semibold text-foreground text-sm">Gemini Flash LLM</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Extracts item names, units, quantities, locations, and deadlines from unstructured speech or text.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-primary mb-2">
                  <Layers className="size-4" /> Stage 2: Bounds Check
                </div>
                <h4 className="font-semibold text-foreground text-sm">Constraint Validation</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Enforces numerical sanity bounds: quantity between 1 and 10,000, realistic delivery deadlines, and valid formats.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-primary mb-2">
                  <Sparkles className="size-4" /> Stage 3: Grounding
                </div>
                <h4 className="font-semibold text-foreground text-sm">Hallucination Audit</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  A separate verification prompt checks extracted data against the raw source text to flag invented fields.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-primary mb-2">
                  <ShieldCheck className="size-4" /> Stage 4: Scoring
                </div>
                <h4 className="font-semibold text-foreground text-sm">Review & Badges</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Computes confidence scores (0.0–1.0) and presents color-coded badges with full audit trail storage in Firestore.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECURITY & ABAC HIGHLIGHT ─── */}
        <section id="security" className="py-16 md:py-24 border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 mb-3">
                  Enterprise Security
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Attribute-Based Access Control (ABAC) built in
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  BidBridge uses comprehensive Firestore security rules with 11 helper functions and multi-condition state validation to ensure zero tampering.
                </p>

                <div className="mt-6 space-y-3.5 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Status Lock & Immutability:</strong> RFQs cannot be modified once awarded. Bid records cannot be deleted, ensuring an audit trail.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Cross-Document State Validation:</strong> Sellers cannot submit bids on closed or non-existent requests.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Anti-Tampering Constraints:</strong> Pricing must be greater than zero and within validated market ranges.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm font-mono text-xs text-muted-foreground space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border text-[11px] font-sans font-semibold text-foreground">
                  <span>firestore.rules</span>
                  <Badge variant="outline" className="text-[10px] bg-secondary font-mono">11 Helper Functions</Badge>
                </div>
                <div className="text-emerald-600 font-semibold">// Layer 4: State & Constraint Validation</div>
                <div className="text-foreground">function rfqIsOpen(rfqId) &#123;</div>
                <div className="pl-4 text-muted-foreground">return get(/databases/$(database)/documents/rfqs/$(rfqId)).data.status == &quot;open&quot;;</div>
                <div className="text-foreground">&#125;</div>
                <div className="text-foreground mt-2">function validPrice(price) &#123;</div>
                <div className="pl-4 text-muted-foreground">return price is number &amp;&amp; price &gt; 0 &amp;&amp; price &lt;= 100000000;</div>
                <div className="text-foreground">&#125;</div>
                <div className="pt-2 text-[11px] text-muted-foreground font-sans">
                  Prevents ownership hijacking, closed RFQ bidding, and unvalidated modifications.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BOTTOM CALL TO ACTION ─── */}
        <section className="py-16 md:py-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(183,121,54,0.15),rgba(255,254,250,0))]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Ready to modernize your procurement process?
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Join buyers posting requests with voice & AI, and suppliers winning contracts with transparent real-time bidding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto px-8 h-11 text-sm font-semibold shadow-sm">
                <Link href={user ? dashboardHref : "/login"}>
                  {user ? "Open Your Workspace" : "Get Started Now"}
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-6 h-11 text-sm font-semibold border-border bg-card">
                <Link href="/login">
                  Sign In to Account
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-secondary/40 py-8 text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
              B
            </span>
            <span>BidBridge</span>
            <span className="text-muted-foreground font-normal">— B2B RFQ Marketplace</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span>Powered by React 19 • Firebase • Gemini Flash</span>
            <span>•</span>
            <span>&copy; 2026 BidBridge. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}