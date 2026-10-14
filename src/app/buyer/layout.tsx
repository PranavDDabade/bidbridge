import { RoleGuard } from "@/components/RoleGuard";
import { AppHeader } from "@/components/AppHeader";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="buyer">
      <AppHeader />
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </RoleGuard>
  );
}