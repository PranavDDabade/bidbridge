"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { BidDoc, RfqDoc, toBid, toRfq } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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
      () => setRfq(null)
    );
  }, [rfqId]);

  useEffect(() => {
    const q = query(collection(db, "bids"), where("rfqId", "==", rfqId));
    return onSnapshot(q, (snap) => setBids(snap.docs.map((d) => toBid(d.id, d.data()))));
  }, [rfqId]);

  const sorted = useMemo(() => {
    if (!bids) return [];
    return [...bids].sort((a, b) =>
      sortKey === "price"
        ? a.price - b.price || a.leadTimeDays - b.leadTimeDays
        : a.leadTimeDays - b.leadTimeDays || a.price - b.price
    );
  }, [bids, sortKey]);

  const lowestPrice = bids && bids.length ? Math.min(...bids.map((b) => b.price)) : null;
  const fastest = bids && bids.length ? Math.min(...bids.map((b) => b.leadTimeDays)) : null;

  async function select(bidId: string) {
    setSelecting(true);
    try {
      await updateDoc(doc(db, "rfqs", rfqId), { status: "closed", selectedBidId: bidId });
      toast.success("Bid selected. The seller will see the result.");
      setConfirmId(null);
    } catch {
      toast.error("Couldn't select that bid. Please try again.");
    } finally {
      setSelecting(false);
    }
  }

  if (rfq === undefined) return <Skeleton className="h-60 w-full" />;
  if (rfq === null || (user && rfq.buyerId !== user.uid))
    return (
      <div className="space-y-3">
        <p>This request doesn&apos;t exist or isn&apos;t yours.</p>
        <Button asChild variant="outline">
          <Link href="/buyer/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );

  const closed = rfq.status === "closed";
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
              {closed ? "Awarded" : "Open"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc pl-5">
            {rfq.items.map((i, idx) => (
              <li key={idx}>
                {`${i.quantity} ${i.unit} ${i.name}`.replace(/\s+/g, " ").trim()}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Deliver to {rfq.location} · needed by {rfq.neededBy}
          </p>
          {editLocked && (
            <p className="text-xs text-muted-foreground">
              Editing is locked once sellers have bid. Post a new request if you need changes.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Bids {bids ? `(${bids.length})` : ""}</h2>
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
          <CardContent className="py-10 text-center space-y-1">
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
              {sorted.map((b) => {
                const isWinner = rfq.selectedBidId === b.id;
                return (
                  <TableRow key={b.id} className={isWinner ? "bg-green-50 hover:bg-green-50/80" : ""}>
                    <TableCell className="font-medium">{b.sellerName}</TableCell>
                    <TableCell>
                      ₹{b.price.toLocaleString("en-IN")}{" "}
                      {b.price === lowestPrice && sorted.length > 1 && (
                        <Badge variant="secondary">Lowest</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {b.leadTimeDays} {b.leadTimeDays === 1 ? "day" : "days"}{" "}
                      {b.leadTimeDays === fastest && sorted.length > 1 && (
                        <Badge variant="secondary">Fastest</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[240px] whitespace-normal text-sm text-muted-foreground">
                      {b.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isWinner ? (
                        <Badge>Selected</Badge>
                      ) : !closed ? (
                        confirmId === b.id ? (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" disabled={selecting} onClick={() => select(b.id)}>
                              {selecting ? "Selecting..." : "Confirm"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => setConfirmId(b.id)}>
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