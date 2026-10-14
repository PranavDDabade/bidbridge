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
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/seller/inbox">← Back to inbox</Link>
      </Button>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Request details</CardTitle>
          {closed && <Badge variant="secondary">Awarded</Badge>}
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
        </CardContent>
      </Card>

      {closed ? (
        <Card>
          <CardContent className="py-6 text-center">
            {won ? (
              <p className="font-medium text-green-700">
                Congratulations, your bid was selected.
              </p>
            ) : (
              <p className="text-muted-foreground">
                This request was awarded to another seller.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {bidId ? "Update your bid" : "Submit a bid"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="price">Total price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={1}
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lead">Lead time (days)</Label>
                  <Input
                    id="lead"
                    type="number"
                    min={0}
                    required
                    value={lead}
                    onChange={(e) => setLead(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  placeholder="Substitutions, delivery terms, anything the buyer should know"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : bidId ? "Update bid" : "Submit bid"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}