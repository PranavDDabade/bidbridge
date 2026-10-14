"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export function RoleGuard({ role, children }: { role: "buyer" | "seller"; children: React.ReactNode }) {
  const { user, role: myRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!myRole) router.replace("/onboarding");
    else if (myRole !== role) {
      toast.error(`That page is only for ${role}s.`);
      router.replace(myRole === "buyer" ? "/buyer/dashboard" : "/seller/inbox");
    }
  }, [user, myRole, loading, role, router]);

  if (loading || !user || myRole !== role) {
    return <div className="p-8"><Skeleton className="h-40 w-full" /></div>;
  }
  return <>{children}</>;
}