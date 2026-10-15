"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
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
  const [bidsExist, setBidsExist] = useState(false);

  useEffect(() => {
    return onSnapshot(
      doc(db, "rfqs", rfqId),
      (snap) => {
        if (!snap.exists()) {
          setRfq(null);
          return;
        }

        const currentRfq = toRfq(snap.id, snap.data());
        setRfq(currentRfq);

        // Initialize fields once so later snapshots do not overwrite typing.
        setLoaded((wasLoaded) => {
          if (!wasLoaded) {
            setItems(currentRfq.items.map((item) => ({ ...item })));
            setLocation(currentRfq.location);
            setNeededBy(currentRfq.neededBy);
          }
          return true;
        });
      },
      (err) => {
        console.error("Failed to load RFQ for editing:", err);
        setRfq(null);
      }
    );
  }, [rfqId]);

  useEffect(() => {
    const q = query(collection(db, "bids"), where("rfqId", "==", rfqId));

    return onSnapshot(
      q,
      (snap) => setBidsExist(!snap.empty),
      (err) => {
        console.error("Failed to check bids for RFQ:", err);
        // Fail closed: if bid visibility cannot be verified, do not permit editing.
        setBidsExist(true);
        toast.error("Couldn't verify bids. Editing is temporarily disabled.");
      }
    );
  }, [rfqId]);

  function updateItem(index: number, patch: Partial<RfqItemDoc>) {
    setItems((previous) =>
      previous.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      )
    );
  }

  async function save() {
    if (saving) return;

    if (!user) {
      toast.error("Please sign in to edit this request.");
      return;
    }

    if (!rfq || rfq.buyerId !== user.uid) {
      toast.error("You can only edit your own request.");
      return;
    }

    if (rfq.status !== "open") {
      toast.error("This request is no longer open.");
      return;
    }

    if (bidsExist) {
      toast.error("A seller has bid, so this request can no longer be edited.");
      router.replace(`/buyer/rfq/${rfqId}`);
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one item.");
      return;
    }

    for (const item of items) {
      if (!item.name.trim()) {
        toast.error("Every item needs a name.");
        return;
      }

      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        toast.error(`Enter a valid quantity for "${item.name}".`);
        return;
      }
    }

    if (!location.trim()) {
      toast.error("Enter a delivery location.");
      return;
    }

    if (!neededBy.trim()) {
      toast.error("Enter when you need it.");
      return;
    }

    setSaving(true);

    try {
      // Re-check before saving. Firestore rules must also enforce the policy;
      // this client check alone cannot prevent a concurrent bid from being placed.
      const bidsSnap = await getDocs(
        query(collection(db, "bids"), where("rfqId", "==", rfqId))
      );

      if (!bidsSnap.empty) {
        setBidsExist(true);
        toast.error(
          "A seller has placed a bid, so this request can no longer be edited."
        );
        router.replace(`/buyer/rfq/${rfqId}`);
        return;
      }

      // The rules' editable-field allowlist uses updatedAt, not editedAt.
      await updateDoc(doc(db, "rfqs", rfqId), {
        items: items.map((item) => ({
          name: item.name.trim(),
          quantity: item.quantity,
          unit: (item.unit ?? "").trim(),
        })),
        location: location.trim(),
        neededBy: neededBy.trim(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Request updated.");
      router.replace(`/buyer/rfq/${rfqId}`);
    } catch (err) {
      console.error("Failed to save RFQ changes:", err);

      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : "";

      if (code === "permission-denied") {
        toast.error(
          "Permission denied. Confirm that the RFQ is open, belongs to you, and the rules allow these fields."
        );
      } else {
        toast.error("Couldn't save changes. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (rfq === undefined) return <Skeleton className="h-60 w-full" />;

  if (rfq === null || !user || rfq.buyerId !== user.uid) {
    return <p>This request doesn't exist or isn't yours.</p>;
  }

  if (rfq.status !== "open") {
    return (
      <div className="space-y-3">
        <p>This request is no longer open and cannot be edited.</p>
        <Button asChild variant="outline">
          <Link href={`/buyer/rfq/${rfqId}`}>Back</Link>
        </Button>
      </div>
    );
  }

  if (bidsExist) {
    return (
      <div className="space-y-3">
        <p>A seller has submitted a bid, so this request can no longer be edited.</p>
        <Button asChild variant="outline">
          <Link href={`/buyer/rfq/${rfqId}`}>Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/buyer/rfq/${rfqId}`}>← Cancel</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-12 space-y-1 sm:col-span-5">
                <Label>Item</Label>
                <Input
                  value={item.name}
                  onChange={(event) =>
                    updateItem(index, { name: event.target.value })
                  }
                />
              </div>

              <div className="col-span-5 space-y-1 sm:col-span-3">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity ?? ""}
                  onChange={(event) =>
                    updateItem(index, {
                      quantity:
                        event.target.value === ""
                          ? ("" as unknown as number)
                          : Number(event.target.value),
                    })
                  }
                />
              </div>

              <div className="col-span-5 space-y-1 sm:col-span-3">
                <Label>Unit</Label>
                <Input
                  value={item.unit ?? ""}
                  onChange={(event) =>
                    updateItem(index, { unit: event.target.value })
                  }
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="col-span-2 sm:col-span-1"
                disabled={items.length === 1}
                onClick={() =>
                  setItems((previous) =>
                    previous.filter((_, currentIndex) => currentIndex !== index)
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setItems((previous) => [
                ...previous,
                { name: "", quantity: 1, unit: "" } as RfqItemDoc,
              ])
            }
          >
            + Add item
          </Button>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Delivery location</Label>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Needed by</Label>
              <Input
                value={neededBy}
                onChange={(event) => setNeededBy(event.target.value)}
              />
            </div>
          </div>

          <Button type="button" onClick={save} disabled={saving || bidsExist}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
