"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where,
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
  const [rfq, setRfq] = useState<RfqDoc | null | undefined>(undefined); // undefined = loading, null = not found
  const [bidId, setBidId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [lead, setLead] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(
      doc(db, "rfqs", rfqId),
      (snap) => setRfq(snap.exists() ? toRfq(snap.id, snap.data()) : null),
      () => setRfq(null)
    );
  }, [rfqId]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bids"),
      where("rfqId", "==", rfqId),
      where("sellerId", "==", user.uid)
    );
    return onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const d = snap.docs[0];
      setBidId(d.id);
      const data = d.data();
      setPrice(String(data.price));
      setLead(String(data.leadTimeDays));
      setNotes(data.notes ?? "");
    });
  }, [user, rfqId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !rfq) return;
    const p = Number(price);
    const l = Number(lead);
    if (!Number.isFinite(p) || p <= 0) return toast.error("Enter a price above 0.");
    if (!Number.isInteger(l) || l < 0)
      return toast.error("Lead time must be a whole number of days.");

    setSaving(true);
    try {
      if (bidId) {
        await updateDoc(doc(db, "bids", bidId), {
          price: p,
          leadTimeDays: l,
          notes: notes.trim(),
        });
        toast.success("Bid updated.");
      } else {
        const ref = await addDoc(collection(db, "bids"), {
          rfqId,
          sellerId: user.uid,
          sellerName: name || "Seller",
          price: p,
          leadTimeDays: l,
          notes: notes.trim(),
          createdAt: serverTimestamp(),
        });
        setBidId(ref.id);
        toast.success("Bid submitted.");
      }
    } catch {
      toast.error("Couldn't save your bid. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (rfq === undefined) return <Skeleton className="h-60 w-full" />;
  if (rfq === null)
    return (
      <div className="space-y-3">
        <p>This request doesn&apos;t exist or was removed.</p>
        <Button asChild variant="outline">
          <Link href="/seller/inbox">Back to inbox</Link>
        </Button>
      </div>
    );

  const closed = rfq.status === "closed";
  const won = closed && rfq.selectedBidId !== null && rfq.selectedBidId === bidId;

  return (
    <div className="fade-in mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/seller/inbox">← Back to inbox</Link>
      </Button>

      {/* Request details */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Request details</CardTitle>
          <Badge
            className={
              closed
                ? "bg-secondary text-muted-foreground hover:bg-secondary border-border"
                : "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
            }
          >
            {closed ? "Awarded" : "Open"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-sm font-semibold text-primary">
              {rfq.buyerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Requested by</p>
              <p className="font-semibold leading-tight">{rfq.buyerName}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Items needed</p>
            <ul className="divide-y rounded-lg border">
              {rfq.items.map((i, idx) => (
                <li key={idx} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium">{i.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {i.quantity} {i.unit}
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

      {/* Bid area */}
      {closed ? (
        <Card className={won ? "border-green-200 bg-green-50/50" : ""}>
          <CardContent className="space-y-1 py-8 text-center">
            <div className="text-3xl">{won ? "🎉" : "🏁"}</div>
            {won ? (
              <>
                <p className="font-semibold text-green-800">Your bid was selected</p>
                <p className="text-sm text-muted-foreground">
                  The buyer chose your offer. Get ready to fulfil the order.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">This request was awarded</p>
                <p className="text-sm text-muted-foreground">
                  The buyer chose another seller this time.
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
                ? "You can change your offer until the buyer picks a winner."
                : "Give the buyer your total price and how fast you can deliver."}
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
                    min={1}
                    required
                    placeholder="e.g. 12500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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
                    required
                    placeholder="e.g. 2"
                    value={lead}
                    onChange={(e) => setLead(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  placeholder="Substitutions, delivery terms, anything the buyer should know"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? "Saving..." : bidId ? "Update bid" : "Submit bid"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}