"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { name, role, logout } = useAuth();
  const router = useRouter();
  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <span className="font-semibold">BidBridge</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:inline">{name}</span>
        <Badge variant="secondary" className="capitalize">{role}</Badge>
        <Button variant="outline" size="sm"
          onClick={async () => { await logout(); router.replace("/login"); }}>
          Log out
        </Button>
      </div>
    </header>
  );
}