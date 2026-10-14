export type RfqItemDoc = { name: string; quantity: number; unit: string };

export type RfqDoc = {
  id: string;
  buyerId: string;
  items: RfqItemDoc[];
  location: string;
  neededBy: string;
  status: "open" | "closed";
  selectedBidId: string | null;
  createdAtMs: number;
};

export type BidDoc = {
  id: string;
  rfqId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  leadTimeDays: number;
  notes: string;
  createdAtMs: number;
};

export function itemsToText(items: RfqItemDoc[]) {
  return items
    .map((i) => `${i.quantity} ${i.unit} ${i.name}`.replace(/\s+/g, " ").trim())
    .join(", ");
}

export function toRfq(id: string, d: any): RfqDoc {
  return {
    id,
    buyerId: d.buyerId,
    items: d.items ?? [],
    location: d.location ?? "",
    neededBy: d.neededBy ?? "",
    status: d.status ?? "open",
    selectedBidId: d.selectedBidId ?? null,
    createdAtMs: d.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export function toBid(id: string, d: any): BidDoc {
  return {
    id,
    rfqId: d.rfqId,
    sellerId: d.sellerId,
    sellerName: d.sellerName ?? "Seller",
    price: d.price,
    leadTimeDays: d.leadTimeDays,
    notes: d.notes ?? "",
    createdAtMs: d.createdAt?.toMillis?.() ?? Date.now(),
  };
}