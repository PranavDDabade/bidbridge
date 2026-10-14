"use client";
import { useState } from "react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import VoiceButton from "@/components/VoiceButton";


type Draft = {
    items: RfqItem[];
    location: string;
    neededBy: string;
    missing: string[];
};

type AuditInfo = {
    model: string;
    confidence: number;
    groundingPassed: boolean;
    needsReview: boolean;
    reviewReason: string;
};

export default function NewRfqForm() {
    const { user, name } = useAuth();
    const router = useRouter();
    const [rawText, setRawText] = useState("");
    const [draft, setDraft] = useState<Draft | null>(null);
    const [audit, setAudit] = useState<AuditInfo | null>(null);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [aiFailed, setAiFailed] = useState(false);
    const [submittedText, setSubmittedText] = useState("");


    async function understand() {
        if (rawText.trim().length < 3) {
            toast.error("Describe what you need first.");
            return;
        }
        const text = rawText.trim();
        setParsing(true);
        setAiFailed(false);
        setAudit(null);
        try {
            const res = await fetch("/api/parse-rfq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const json = await res.json();
            if (json.ok) {
                setDraft({
                    items: json.data.items.map((it: RfqItem) => ({
                        ...it,
                        unit: it.unit?.trim() || (it.quantity ? "pcs" : ""),
                    })),
                    location: json.data.location ?? "",
                    neededBy: json.data.neededBy ?? "",
                    missing: json.data.missing,
                });
                setAudit(json.audit || null);
                setSubmittedText(text);
                setRawText("");

                if (json.audit?.needsReview) {
                    toast.warning(json.audit.reviewReason);
                }
            } else {
                throw new Error(json.error);
            }
        } catch (err) {
            setAiFailed(true);
            setSubmittedText(text);
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

                rawText: submittedText,
                items: draft.items.map((it) => ({
                    name: it.name.trim(),
                    quantity: it.quantity,
                    unit: it.unit?.trim() || "",
                })),
                location: draft.location.trim(),
                neededBy: draft.neededBy.trim(),
                status: "open",
                selectedBidId: null,
                aiAudit: audit ? {
                    model: audit.model,
                    confidence: audit.confidence,
                    groundingPassed: audit.groundingPassed,
                    timestamp: Date.now(),
                } : null,
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
    const confidenceColor = audit?.confidence ? (
        audit.confidence >= 0.85 ? "bg-green-100 text-green-800" :
        audit.confidence >= 0.7 ? "bg-yellow-100 text-yellow-800" :
        "bg-red-100 text-red-800"
    ) : "";

    return (
        <div className="space-y-6">

            <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link href="/buyer/dashboard">← Back to inbox</Link>
            </Button>
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
                    <p className="text-xs text-muted-foreground">
                        Voice can mishear. Check the text, fix any mistakes, then press Understand.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={understand} disabled={parsing}>
                            {parsing
                                ? "Reading your request..."
                                : draft
                                    ? "Re-read my request"
                                    : "Understand my request"}
                        </Button>
                        <VoiceButton
                            onLive={(t) => setRawText(t)}
                            onText={(t) => setRawText(t)}
                        />
                    </div>
                </CardContent>
            </Card>

            {audit && !aiFailed && (
                <Card className={audit.needsReview ? "border-yellow-200 bg-yellow-50/50" : ""}>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">AI Analysis:</span>
                                    <Badge className={confidenceColor}>
                                        {(audit.confidence * 100).toFixed(0)}% confident
                                    </Badge>
                                    {audit.groundingPassed ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓ No hallucinations</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">⚠ Review needed</Badge>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">via {audit.model}</span>
                            </div>
                            {audit.needsReview && (
                                <div className="text-sm text-yellow-800 bg-yellow-100/50 rounded p-2">
                                    ⚠️ {audit.reviewReason}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

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