"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { RfqDoc, toRfq, RfqItemDoc } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditRfqForm({ rfqId }: { rfqId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [rfq, setRfq] = useState<RfqDoc | null | undefined>(undefined);
  const [items, setItems] = useState<RfqItemDoc[]>([]);
  const [location, setLocation] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // one-time load into the form; don't overwrite the buyer's typing on later snapshots
    return onSnapshot(
      doc(db, "rfqs", rfqId),
      (snap) => {
        if (!snap.exists()) return setRfq(null);
        const r = toRfq(snap.id, snap.data());
        setRfq(r);
        setLoaded((was) => {
          if (!was) {
            setItems(r.items.map((i) => ({ ...i })));
            setLocation(r.location);
            setNeededBy(r.neededBy);
          }
          return true;
        });
      },
      () => setRfq(null)
    );
  }, [rfqId]);

  function updateItem(i: number, patch: Partial<RfqItemDoc>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function save() {
    if (!rfq || !user) return;
    for (const it of items) {
      if (!it.name.trim()) return toast.error("Every item needs a name.");
      if (!it.quantity || it.quantity <= 0) return toast.error(`Enter a quantity for "${it.name}".`);
    }
    if (!location.trim()) return toast.error("Enter a delivery location.");
    if (!neededBy.trim()) return toast.error("Enter when you need it.");

    setSaving(true);
    try {
      // re-check at save time: a seller may have bid while the buyer was editing
      const bidsSnap = await getDocs(query(collection(db, "bids"), where("rfqId", "==", rfqId)));
      if (!bidsSnap.empty) {
        toast.error("A seller just placed a bid, so this request can no longer be edited.");
        router.replace(`/buyer/rfq/${rfqId}`);
        return;
      }
      await updateDoc(doc(db, "rfqs", rfqId), {
        items: items.map((i) => ({ name: i.name.trim(), quantity: i.quantity, unit: (i.unit ?? "").trim() })),
        location: location.trim(),
        neededBy: neededBy.trim(),
        editedAt: serverTimestamp(),
      });
      toast.success("Request updated.");
      router.replace(`/buyer/rfq/${rfqId}`);
    } catch {
      toast.error("Couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (rfq === undefined) return <Skeleton className="h-60 w-full" />;
  if (rfq === null || (user && rfq.buyerId !== user.uid))
    return <p>This request doesn&apos;t exist or isn&apos;t yours.</p>;
  if (rfq.status === "closed")
    return (
      <div className="space-y-3">
        <p>This request has been awarded and can no longer be edited.</p>
        <Button asChild variant="outline"><Link href={`/buyer/rfq/${rfqId}`}>Back</Link></Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link href={`/buyer/rfq/${rfqId}`}>← Cancel</Link></Button>
      <Card>
        <CardHeader><CardTitle className="text-base">Edit request</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-12 sm:col-span-5 space-y-1">
                <Label>Item</Label>
                <Input value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
              </div>
              <div className="col-span-5 sm:col-span-3 space-y-1">
                <Label>Quantity</Label>
                <Input type="number" min={1} value={it.quantity ?? ""}
                  onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} />
              </div>
              <div className="col-span-5 sm:col-span-3 space-y-1">
                <Label>Unit</Label>
                <Input value={it.unit ?? ""} onChange={(e) => updateItem(i, { unit: e.target.value })} />
              </div>
              <Button variant="ghost" size="sm" className="col-span-2 sm:col-span-1"
                disabled={items.length === 1}
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm"
            onClick={() => setItems([...items, { name: "", quantity: 1, unit: "" }])}>
            + Add item
          </Button>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Delivery location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Needed by</Label>
              <Input value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
            </div>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}