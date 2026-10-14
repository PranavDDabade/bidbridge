"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const { user, role, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (role) router.replace("/");
  }, [user, role, loading, router]);

  async function choose(selected: "buyer" | "seller") {
    if (!user) return;
    if (name.trim().length < 2) {
      toast.error("Please enter your name or company name first.");
      return;
    }
    setBusy(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        role: selected,
        name: name.trim(),
        createdAt: serverTimestamp(),
      });
      await refreshProfile();
      router.replace("/");
    } catch {
      toast.error("Couldn't save your choice. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>How will you use BidBridge?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your name or company</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left whitespace-normal"
              disabled={busy} onClick={() => choose("buyer")}>
              <span className="font-semibold">I'm a Buyer</span>
              <span className="text-sm font-normal text-muted-foreground">
                I need materials and want quotes.
              </span>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left whitespace-normal"
              disabled={busy} onClick={() => choose("seller")}>
              <span className="font-semibold">I'm a Seller</span>
              <span className="text-sm font-normal text-muted-foreground">
                I supply materials and want to bid.
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}