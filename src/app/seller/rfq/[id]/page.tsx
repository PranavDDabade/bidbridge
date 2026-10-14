import SellerRfqDetail from "@/components/SellerRfqDetail";

export const instant = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerRfqDetail rfqId={id} />;
}