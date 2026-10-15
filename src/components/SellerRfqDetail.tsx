"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { RfqDoc, toRfq } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerRfqDetail({ rfqId }: { rfqId: string }) {
  const { user, name } = useAuth();

  const [rfq, setRfq] = useState<RfqDoc | null | undefined>(undefined);
  const [bidId, setBidId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [lead, setLead] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Listen for RFQ updates and report permission/network errors clearly.
  useEffect(() => {
    setRfq(undefined);

    return onSnapshot(
      doc(db, "rfqs", rfqId),
      (snap) => {
        setRfq(snap.exists() ? toRfq(snap.id, snap.data()) : null);
      },
      (error) => {
        console.error("Failed to load RFQ:", error);
        setRfq(null);
        toast.error("Couldn't load this request. Check your access and connection.");
      }
    );
  }, [rfqId]);

  // Load this seller's existing bid for the RFQ, if one exists.
  useEffect(() => {
    setBidId(null);
    setPrice("");
    setLead("");
    setNotes("");

    if (!user) return;

    const bidsQuery = query(
      collection(db, "bids"),
      where("rfqId", "==", rfqId),
      where("sellerId", "==", user.uid)
    );

    return onSnapshot(
      bidsQuery,
      (snap) => {
        if (snap.empty) {
          setBidId(null);
          setPrice("");
          setLead("");
          setNotes("");
          return;
        }

        const bid = snap.docs[0];
        const data = bid.data();

        setBidId(bid.id);
        setPrice(data.price == null ? "" : String(data.price));
        setLead(data.leadTimeDays == null ? "" : String(data.leadTimeDays));
        setNotes(typeof data.notes === "string" ? data.notes : "");
      },
      (error) => {
        console.error("Failed to load seller bid:", error);
        toast.error("Couldn't load your existing bid. Check your access and connection.");
      }
    );
  }, [user, rfqId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    if (!user) {
      toast.error("Please sign in before submitting a bid.");
      return;
    }

    if (!rfq) {
      toast.error("This request could not be loaded.");
      return;
    }

    const p = Number(price);
    const l = Number(lead);

    if (!price.trim() || !Number.isFinite(p) || p <= 0) {
      toast.error("Enter a valid price above 0.");
      return;
    }

    if (!lead.trim() || !Number.isInteger(l) || l < 0) {
      toast.error("Lead time must be a whole number of days.");
      return;
    }

    setSaving(true);

    try {
      // Re-check the latest RFQ state before attempting the write.
      const rfqSnapshot = await getDoc(doc(db, "rfqs", rfqId));

      if (!rfqSnapshot.exists()) {
        toast.error("This request no longer exists.");
        return;
      }

      if (rfqSnapshot.data().status !== "open") {
        toast.error("This request is no longer open for bids.");
        return;
      }

      const bidFields = {
        price: p,
        leadTimeDays: l,
        notes: notes.trim(),
      };

      if (bidId) {
        await updateDoc(doc(db, "bids", bidId), {
          ...bidFields,
          updatedAt: serverTimestamp(),
        });

        toast.success("Bid updated successfully.");
      } else {
        const newBid = await addDoc(collection(db, "bids"), {
          rfqId,
          sellerId: user.uid,
          sellerName: name || "Seller",
          ...bidFields,
          createdAt: serverTimestamp(),
        });

        setBidId(newBid.id);
        toast.success("Bid submitted successfully.");
      }
    } catch (error: unknown) {
      console.error("Bid submission failed:", error);

      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";

      if (code.includes("permission-denied")) {
        toast.error(
          "Permission denied. Check your seller role and Firestore bid rules."
        );
      } else if (code.includes("unauthenticated")) {
        toast.error("Your session expired. Please sign in again.");
      } else if (code.includes("unavailable")) {
        toast.error("Service temporarily unavailable. Please try again.");
      } else {
        toast.error("Couldn't save your bid. Check the browser console for details.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (rfq === undefined) {
    return <Skeleton className="h-60 w-full" />;
  }

  if (rfq === null) {
    return (
      <div className="space-y-3">
        <p>This request doesn't exist, was removed, or you don't have permission to view it.</p>
        <Button asChild variant="outline">
          <Link href="/seller/inbox">Back to inbox</Link>
        </Button>
      </div>
    );
  }

  const closed = rfq.status !== "open";
  const won =
    closed && rfq.selectedBidId != null && rfq.selectedBidId === bidId;

  return (
    <div className="fade-in mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/seller/inbox">← Back to inbox</Link>
      </Button>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">
            Request details
          </CardTitle>
          <Badge
            className={
              closed
                ? "border-border bg-secondary text-muted-foreground hover:bg-secondary"
                : "border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
            }
          >
            {closed ? "Awarded / Closed" : "Open"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-sm font-semibold text-primary">
              {(rfq.buyerName || "B").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Requested by</p>
              <p className="font-semibold leading-tight">
                {rfq.buyerName || "Buyer"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Items needed</p>
            <ul className="divide-y rounded-lg border">
              {rfq.items.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-right text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Deliver to</p>
              <p className="font-medium">{rfq.location}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Needed by</p>
              <p className="font-medium">{rfq.neededBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {closed ? (
        <Card className={won ? "border-green-200 bg-green-50/50" : ""}>
          <CardContent className="space-y-1 py-8 text-center">
            <div className="text-3xl">{won ? "🎉" : "🏁"}</div>
            {won ? (
              <>
                <p className="font-semibold text-green-800">
                  Your bid was selected
                </p>
                <p className="text-sm text-muted-foreground">
                  The buyer chose your offer. Get ready to fulfil the order.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">This request is no longer open</p>
                <p className="text-sm text-muted-foreground">
                  The buyer may have awarded or closed this request.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {bidId ? "Update your bid" : "Submit your bid"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {bidId
                ? "You can change your offer until the request is closed."
                : "Give the buyer your total price and how quickly you can deliver."}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Total price (₹)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                    placeholder="e.g. 12500"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead" className="text-sm font-medium">
                    Lead time (days)
                  </Label>
                  <Input
                    id="lead"
                    type="number"
                    min={0}
                    step={1}
                    required
                    placeholder="e.g. 2"
                    value={lead}
                    onChange={(event) => setLead(event.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  placeholder="Substitutions, delivery terms, anything the buyer should know"
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={saving}
                />
              </div>

              <Button
                type="submit"
                disabled={saving || !user}
                className="w-full sm:w-auto"
              >
                {saving ? "Saving..." : bidId ? "Update bid" : "Submit bid"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
