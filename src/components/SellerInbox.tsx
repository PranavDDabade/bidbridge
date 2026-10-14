"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { RfqDoc, toRfq } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function timeAgo(ms: number) {
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

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
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Open requests</h1>
        <p className="text-sm text-muted-foreground">
          Buyers looking for quotes. Newest first.
        </p>
      </div>

      {error && (
        <p className="text-red-700">Couldn&apos;t load requests. Refresh and try again.</p>
      )}

      {rfqs === null && !error && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {rfqs?.length === 0 && (
        <Card>
          <CardContent className="space-y-2 py-12 text-center">
            <div className="text-3xl">🔍</div>
            <p className="font-medium">No open requests right now</p>
            <p className="text-sm text-muted-foreground">
              New requests from buyers will show up here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {rfqs?.map((r) => {
          const bid = myBids.has(r.id);
          const shown = r.items.slice(0, 3);
          const extra = r.items.length - shown.length;
          return (
            <Link key={r.id} href={`/seller/rfq/${r.id}`} className="block">
              <Card className="transition-all hover:border-primary/40 hover:shadow-md">
                <CardContent className="space-y-4 py-5">
                  {/* top row: buyer + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-700">
                        {r.buyerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{r.buyerName}</p>
                        <p className="text-xs text-muted-foreground">
                          Posted {timeAgo(r.createdAtMs)}
                        </p>
                      </div>
                    </div>
                    {bid ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        You bid
                      </Badge>
                    ) : (
                      <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                        New
                      </Badge>
                    )}
                  </div>

                  {/* items as chips */}
                  <div className="flex flex-wrap gap-2">
                    {shown.map((i, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-muted px-2.5 py-1 text-sm font-medium"
                      >
                        {`${i.quantity} ${i.unit} ${i.name}`.replace(/\s+/g, " ").trim()}
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="rounded-md px-2.5 py-1 text-sm text-muted-foreground">
                        +{extra} more
                      </span>
                    )}
                  </div>

                  {/* bottom row: location and date */}
                  <div className="grid gap-2 border-t pt-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Deliver to</p>
                      <p className="font-medium">{r.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Needed by</p>
                      <p className="font-medium">{r.neededBy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}