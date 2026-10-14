"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

type Rfq = {
  id: string;
  items: { name: string; quantity: number; unit: string }[];
  location: string;
  neededBy: string;
  status: "open" | "closed";
  createdAtMs: number;
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rfqs"), where("buyerId", "==", user.uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            items: data.items ?? [],
            location: data.location ?? "",
            neededBy: data.neededBy ?? "",
            status: data.status ?? "open",
            createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
          } as Rfq;
        });
        // newest first, sorted in code so no Firestore index is needed
        list.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setRfqs(list);
        setError(null);
      },
      (err) => {
        console.error("dashboard query failed", err);
        setError(err.code ?? "unknown");
        setRfqs([]);
      }
    );
  }, [user]);

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My requests</h1>
          <p className="text-sm text-muted-foreground">
            Requests you&apos;ve posted, newest first.
          </p>
        </div>
        <Button asChild>
          <Link href="/buyer/rfq/new">New request</Link>
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 text-sm text-red-700">
            Couldn&apos;t load your requests ({error}). Check your connection and
            refresh. If it says permission-denied, check the Firestore rules.
          </CardContent>
        </Card>
      )}

      {rfqs === null && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {rfqs?.length === 0 && !error && (
        <Card>
          <CardContent className="space-y-3 py-12 text-center">
            <div className="text-3xl">📭</div>
            <p className="font-medium">No requests yet</p>
            <p className="text-sm text-muted-foreground">
              Describe what you need in plain words and we&apos;ll turn it into a
              quote request.
            </p>
            <Button asChild>
              <Link href="/buyer/rfq/new">Create your first request</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rfqs?.map((r) => (
          <Link key={r.id} href={`/buyer/rfq/${r.id}`} className="block">
            <Card className="transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {r.items
                      .map((i) =>
                        `${i.quantity} ${i.unit} ${i.name}`
                          .replace(/\s+/g, " ")
                          .trim()
                      )
                      .join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {r.location} · needed by {r.neededBy}
                  </p>
                </div>
                <Badge
                  className={
                    r.status === "open"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                  }
                >
                  {r.status === "open" ? "Open" : "Awarded"}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}