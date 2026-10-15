"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { BidDoc, RfqDoc, toBid, toRfq } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortKey = "price" | "lead";

export default function BuyerRfqDetail({ rfqId }: { rfqId: string }) {
  const { user } = useAuth();
  const [rfq, setRfq] = useState<RfqDoc | null | undefined>(undefined);
  const [bids, setBids] = useState<BidDoc[] | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    return onSnapshot(
      doc(db, "rfqs", rfqId),
      (snap) => setRfq(snap.exists() ? toRfq(snap.id, snap.data()) : null),
      (err) => {
        console.error("Failed to load RFQ:", err);
        setRfq(null);
      }
    );
  }, [rfqId]);

  useEffect(() => {
    // Rules must permit the RFQ's owning buyer to read bids for this RFQ.
    const q = query(collection(db, "bids"), where("rfqId", "==", rfqId));
    return onSnapshot(
      q,
      (snap) => setBids(snap.docs.map((d) => toBid(d.id, d.data()))),
      (err) => {
        console.error("Failed to load bids:", err);
        setBids(null);
        toast.error("Couldn't load bids. Check your Firestore read rules.");
      }
    );
  }, [rfqId]);

  const sorted = useMemo(() => {
    if (!bids) return [];
    return [...bids].sort((a, b) =>
      sortKey === "price"
        ? a.price - b.price || a.leadTimeDays - b.leadTimeDays
        : a.leadTimeDays - b.leadTimeDays || a.price - b.price
    );
  }, [bids, sortKey]);

  const lowestPrice =
    bids?.length ? Math.min(...bids.map((b) => b.price)) : null;
  const fastest =
    bids?.length ? Math.min(...bids.map((b) => b.leadTimeDays)) : null;

  async function select(bidId: string) {
    if (!user) {
      toast.error("Please sign in to select a bid.");
      return;
    }

    if (!rfq || rfq.buyerId !== user.uid) {
      toast.error("You can only select a bid for your own request.");
      return;
    }

    if (rfq.status !== "open") {
      toast.error("This request is no longer open.");
      return;
    }

    const selectedBid = bids?.find((bid) => bid.id === bidId);
    if (!selectedBid || selectedBid.rfqId !== rfqId) {
      toast.error("That bid doesn't belong to this request.");
      return;
    }

    setSelecting(true);
    try {
      // Keep "closed" consistent with this component and the seller UI.
      // Security rules independently verify ownership and bid/RFQ linkage.
      await updateDoc(doc(db, "rfqs", rfqId), {
        status: "closed",
        selectedBidId: bidId,
        updatedAt: serverTimestamp(),
      });
      toast.success("Bid selected. The seller will see the result.");
      setConfirmId(null);
    } catch (err) {
      console.error("Failed to select bid:", err);
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : "";

      if (code === "permission-denied") {
        toast.error(
          "Permission denied. Check buyer role, RFQ ownership, status, and bid rules."
        );
      } else {
        toast.error("Couldn't select that bid. Please try again.");
      }
    } finally {
      setSelecting(false);
    }
  }

  if (rfq === undefined) return <Skeleton className="h-60 w-full" />;

  if (rfq === null || !user || rfq.buyerId !== user.uid) {
    return (
      <div className="space-y-3">
        <p>This request doesn't exist or isn't yours.</p>
        <Button asChild variant="outline">
          <Link href="/buyer/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const closed = rfq.status !== "open";
  const canEdit = !closed && bids !== null && bids.length === 0;
  const editLocked = !closed && bids !== null && bids.length > 0;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/buyer/dashboard">← Back</Link>
      </Button>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Your request</CardTitle>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/buyer/rfq/${rfqId}/edit`}>Edit request</Link>
              </Button>
            )}
            <Badge variant={closed ? "secondary" : "default"}>
              {rfq.status === "closed" ? "Awarded" : rfq.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc pl-5">
            {rfq.items.map((item, idx) => (
              <li key={idx}>
                {`${item.quantity} ${item.unit} ${item.name}`
                  .replace(/\s+/g, " ")
                  .trim()}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Deliver to {rfq.location} · needed by {rfq.neededBy}
          </p>
          {editLocked && (
            <p className="text-xs text-muted-foreground">
              Editing is locked once sellers have bid. Post a new request if you
              need changes.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          Bids {bids ? `(${bids.length})` : ""}
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={sortKey === "price" ? "default" : "outline"}
            onClick={() => setSortKey("price")}
          >
            Sort by price
          </Button>
          <Button
            size="sm"
            variant={sortKey === "lead" ? "default" : "outline"}
            onClick={() => setSortKey("lead")}
          >
            Sort by lead time
          </Button>
        </div>
      </div>

      {bids === null && <Skeleton className="h-32 w-full" />}

      {bids?.length === 0 && (
        <Card>
          <CardContent className="space-y-1 py-10 text-center">
            <p className="font-medium">No bids yet</p>
            <p className="text-sm text-muted-foreground">
              Sellers can see your request. Bids will appear here live.
            </p>
          </CardContent>
        </Card>
      )}

      {sorted.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Lead time</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((bid) => {
                const isWinner = rfq.selectedBidId === bid.id;
                return (
                  <TableRow
                    key={bid.id}
                    className={
                      isWinner ? "bg-green-50 hover:bg-green-50/80" : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {bid.sellerName}
                    </TableCell>
                    <TableCell>
                      ₹{bid.price.toLocaleString("en-IN")}{" "}
                      {bid.price === lowestPrice && sorted.length > 1 && (
                        <Badge variant="secondary">Lowest</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {bid.leadTimeDays}{" "}
                      {bid.leadTimeDays === 1 ? "day" : "days"}{" "}
                      {bid.leadTimeDays === fastest && sorted.length > 1 && (
                        <Badge variant="secondary">Fastest</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[240px] whitespace-normal text-sm text-muted-foreground">
                      {bid.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isWinner ? (
                        <Badge>Selected</Badge>
                      ) : !closed ? (
                        confirmId === bid.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={selecting}
                              onClick={() => select(bid.id)}
                            >
                              {selecting ? "Selecting..." : "Confirm"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={selecting}
                              onClick={() => setConfirmId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setConfirmId(bid.id)}
                          >
                            Select bid
                          </Button>
                        )
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
