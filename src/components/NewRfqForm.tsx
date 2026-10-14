"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { RfqItem } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VoiceButton from "@/components/VoiceButton";

type Draft = {
    items: RfqItem[];
    location: string;
    neededBy: string;
    missing: string[];
};

export default function NewRfqForm() {
    const { user, name } = useAuth();
    const router = useRouter();
    const [rawText, setRawText] = useState("");
    const [draft, setDraft] = useState<Draft | null>(null);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [aiFailed, setAiFailed] = useState(false);

    async function understand() {
        if (rawText.trim().length < 3) {
            toast.error("Describe what you need first.");
            return;
        }
        setParsing(true);
        setAiFailed(false);
        try {
            const res = await fetch("/api/parse-rfq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: rawText }),
            });
            const json = await res.json();
            if (json.ok) {
                setDraft({
                    items: json.data.items,
                    location: json.data.location ?? "",
                    neededBy: json.data.neededBy ?? "",
                    missing: json.data.missing,
                });
            } else {
                throw new Error(json.error);
            }
        } catch {
            // Fallback: empty editable form, raw text kept
            setAiFailed(true);
            setDraft({
                items: [{ name: "", quantity: null, unit: "" }],
                location: "",
                neededBy: "",
                missing: [],
            });
            toast.error("The AI couldn't read that. Please fill in the details below.");
        } finally {
            setParsing(false);
        }
    }

    function updateItem(i: number, patch: Partial<RfqItem>) {
        if (!draft) return;
        const items = draft.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
        setDraft({ ...draft, items });
    }

    function validate(d: Draft) {
        if (d.items.length === 0) return "Add at least one item.";
        for (const it of d.items) {
            if (!it.name.trim()) return "Every item needs a name.";
            if (!it.quantity || it.quantity <= 0)
                return `Enter a quantity for "${it.name || "item"}".`;
        }
        if (!d.location.trim()) return "Enter a delivery location.";
        if (!d.neededBy.trim()) return "Enter when you need it.";
        return null;
    }

    async function post() {
        if (!draft || !user) return;
        const problem = validate(draft);
        if (problem) {
            toast.error(problem);
            return;
        }
        setSaving(true);
        try {
            await addDoc(collection(db, "rfqs"), {
                buyerId: user.uid,  
                buyerName: name || "Buyer",

                rawText,
                items: draft.items.map((it) => ({
                    name: it.name.trim(),
                    quantity: it.quantity,
                    unit: it.unit?.trim() || "",
                })),
                location: draft.location.trim(),
                neededBy: draft.neededBy.trim(),
                status: "open",
                selectedBidId: null,
                createdAt: serverTimestamp(),
            });
            toast.success("Request posted. Sellers can now bid.");
            router.replace("/buyer/dashboard");
        } catch {
            toast.error("Couldn't post your request. Please try again.");
            setSaving(false);
        }
    }

    const flagged = (field: string) => draft?.missing.includes(field);
    const flagClass = "border-red-500 focus-visible:ring-red-500";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">New request</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">What do you need?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Textarea
                        rows={4}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="e.g. I need 500 bricks and 10 bags of cement delivered downtown by Friday"
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={understand} disabled={parsing}>
                            {parsing
                                ? "Reading your request..."
                                : draft
                                    ? "Re-read my request"
                                    : "Understand my request"}
                        </Button>
                        <VoiceButton onText={(t) => setRawText((prev) => (prev ? prev + " " : "") + t)} />
                    </div>
                </CardContent>
            </Card>

            {draft && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {aiFailed ? "Fill in the details" : "Check the details"}
                        </CardTitle>
                        {!aiFailed && draft.missing.length > 0 && (
                            <p className="text-sm text-red-600">
                                Some details were missing. The highlighted fields need your input.
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {draft.items.map((it, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-12 sm:col-span-5 space-y-1">
                                    <Label>Item</Label>
                                    <Input
                                        value={it.name}
                                        onChange={(e) => updateItem(i, { name: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-5 sm:col-span-3 space-y-1">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        className={flagged("quantity") && !it.quantity ? flagClass : ""}
                                        value={it.quantity ?? ""}
                                        onChange={(e) =>
                                            updateItem(i, {
                                                quantity: e.target.value === "" ? null : Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="col-span-5 sm:col-span-3 space-y-1">
                                    <Label>Unit</Label>
                                    <Input
                                        value={it.unit ?? ""}
                                        placeholder="bags, pcs, kg"
                                        onChange={(e) => updateItem(i, { unit: e.target.value })}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="col-span-2 sm:col-span-1"
                                    disabled={draft.items.length === 1}
                                    onClick={() =>
                                        setDraft({
                                            ...draft,
                                            items: draft.items.filter((_, idx) => idx !== i),
                                        })
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setDraft({
                                    ...draft,
                                    items: [...draft.items, { name: "", quantity: null, unit: "" }],
                                })
                            }
                        >
                            + Add item
                        </Button>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label>Delivery location</Label>
                                <Input
                                    className={flagged("location") && !draft.location ? flagClass : ""}
                                    value={draft.location}
                                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Needed by</Label>
                                <Input
                                    className={flagged("neededBy") && !draft.neededBy ? flagClass : ""}
                                    value={draft.neededBy}
                                    placeholder="e.g. 20 Oct, or ASAP"
                                    onChange={(e) => setDraft({ ...draft, neededBy: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button onClick={post} disabled={saving} className="w-full sm:w-auto">
                            {saving ? "Posting..." : "Post request"}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}