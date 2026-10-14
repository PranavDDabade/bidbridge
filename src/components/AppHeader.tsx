"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { name, role, logout } = useAuth();
  const router = useRouter();
  const home = role === "buyer" ? "/buyer/dashboard" : "/seller/inbox";
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={home} className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">B</span>
          <span className="text-lg tracking-tight">BidBridge</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>
          <Badge variant="secondary" className="capitalize">{role}</Badge>
          <Button variant="outline" size="sm"
            onClick={async () => { await logout(); router.replace("/login"); }}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}