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
  const [error, setError] = useState(false);

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
      },
      () => setError(true)
    );
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My requests</h1>
        <Button asChild>
          <Link href="/buyer/rfq/new">New request</Link>
        </Button>
      </div>

      {error && (
        <p className="text-red-600">
          Couldn&apos;t load your requests. Refresh and try again.
        </p>
      )}

      {rfqs === null && !error && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {rfqs?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
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
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-4 flex items-center justify-between gap-4">
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
                <Badge variant={r.status === "open" ? "default" : "secondary"}>
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