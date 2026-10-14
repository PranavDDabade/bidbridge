"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { RfqDoc, toRfq, itemsToText } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SellerInbox() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RfqDoc[] | null>(null);
  const [myBids, setMyBids] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "rfqs"), where("status", "==", "open"));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => toRfq(d.id, d.data()));
        list.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setRfqs(list);
      },
      () => setError(true)
    );
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "bids"), where("sellerId", "==", user.uid));
    return onSnapshot(q, (snap) => {
      setMyBids(new Set(snap.docs.map((d) => d.data().rfqId as string)));
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Open requests</h1>

      {error && (
        <p className="text-red-600">Couldn&apos;t load requests. Refresh and try again.</p>
      )}

      {rfqs === null && !error && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {rfqs?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center space-y-1">
            <p className="font-medium">No open requests right now</p>
            <p className="text-sm text-muted-foreground">
              New requests from buyers will show up here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rfqs?.map((r) => (
          <Link key={r.id} href={`/seller/rfq/${r.id}`} className="block">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">{itemsToText(r.items)}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.location} · needed by {r.neededBy}
                  </p>
                </div>
                {myBids.has(r.id) && <Badge>You bid</Badge>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}