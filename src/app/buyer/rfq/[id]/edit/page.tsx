import EditRfqForm from "@/components/EditRfqForm";

export const instant = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditRfqForm rfqId={id} />;
}